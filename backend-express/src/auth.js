import jwt from "jsonwebtoken";
import { ApiError } from "./errors.js";
import { findPublic } from "./users.js";

// 서버가 켜질 때 .env 설정을 읽는다. 키가 이상하면 서버가 시작되지 않는다.
const secret = process.env.JWT_SECRET ?? "";
if (!/^[0-9a-f]{64}$/i.test(secret))
  throw new Error("JWT_SECRET은 64자리 16진수여야 합니다. .env를 확인하세요.");
const key = Buffer.from(secret, "hex");
const issuer = process.env.JWT_ISSUER ?? "webservice-class";
const audience = process.env.JWT_AUDIENCE ?? "board-api";
const ttl = Number(process.env.TOKEN_TTL || 90);

export function issueToken(user) {
  // BE-01: HS256으로 서명한 JWT를 발급한다. (sub, exp, iss, aud 포함)
  return jwt.sign({}, key, {
    algorithm: "HS256",
    subject: String(user.id),
    issuer,
    audience,
    expiresIn: ttl,
  });
}

// "Authorization: Bearer eyJ…" 에서 JWT만 꺼낸다. 없거나 형식이 다르면 null.
function readBearer(req) {
  const match = /^Bearer ([^\s]+)$/.exec(req.get("Authorization") ?? "");
  return match ? match[1] : null;
}

// verify를 통과해도, 우리 서비스가 요구하는 sub·exp 모양인지 한 번 더 확인한다.
function validClaims(p) {
  return (
    typeof p === "object" &&
    p !== null &&
    typeof p.sub === "string" &&
    /^[1-9]\d*$/.test(p.sub) &&
    Number.isSafeInteger(Number(p.sub)) &&
    Number.isInteger(p.exp)
  );
}

export function currentUserId(req) {
  // BE-02: 토큰을 꺼내 검증하고 로그인한 사용자 id를 돌려준다.
  // 토큰이 없거나 변조·만료되면 401이다.
  const token = readBearer(req);
  if (!token) throw new ApiError(401, "TOKEN_REQUIRED", "로그인이 필요합니다.");
  let p;
  try {
    p = jwt.verify(token, key, { algorithms: ["HS256"], issuer, audience });
  } catch (error) {
    if (error.name === "TokenExpiredError")
      throw new ApiError(
        401,
        "TOKEN_EXPIRED",
        "로그인 시간이 만료되었습니다. 다시 로그인하세요.",
      );
    throw new ApiError(401, "INVALID_TOKEN", "토큰이 올바르지 않습니다.");
  }
  if (!validClaims(p) || !findPublic(Number(p.sub)))
    throw new ApiError(401, "INVALID_TOKEN", "토큰이 올바르지 않습니다.");
  return Number(p.sub);
}
export function assertOwner(userId, authorId) {
  // BE-03: 글쓴이가 아니면 403 FORBIDDEN.
  if (userId !== authorId)
    throw new ApiError(
      403,
      "FORBIDDEN",
      "본인이 작성한 글만 수정하거나 삭제할 수 있습니다.",
    );
}
