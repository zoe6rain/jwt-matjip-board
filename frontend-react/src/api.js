// 로그인 정보(토큰)는 이 변수(메모리)에만 둔다. localStorage에는 저장하지 않는다.
let session = { accessToken: "", user: null };
export const getSession = () => session;
export function clearSession() {
  session = { accessToken: "", user: null };
}
// 서버가 보내는 오류 코드(code)별로 화면에 보여 줄 안내 문구
const messages = {
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  TOKEN_REQUIRED: "로그인이 필요합니다. 먼저 로그인하세요.",
  INVALID_TOKEN: "로그인 정보가 올바르지 않습니다. 다시 로그인하세요.",
  TOKEN_EXPIRED: "로그인 시간이 지났습니다. 다시 로그인하세요.",
  FORBIDDEN: "본인이 쓴 글만 수정하거나 삭제할 수 있습니다.",
  BAD_INPUT: "입력 내용을 확인하세요.",
  NOT_FOUND: "글을 찾을 수 없습니다. 목록을 새로 불러옵니다.",
};
function authorizationHeaders() {
  // FE-02: 토큰이 있을 때만 Bearer 헤더를 보낸다. (없으면 헤더를 아예 안 보냄)
  const token = session.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
export async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeaders(),
      ...options.headers,
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    // FE-03: 401이면 메모리의 로그인 상태도 해제한다. (403은 로그아웃하지 않음)
    if (response.status === 401) clearSession();
    const error = new Error(
      messages[data.code] ||
        data.message ||
        data.code ||
        `HTTP ${response.status}`,
    );
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}
export async function login(email, password) {
  // FE-01: 로그인 요청 → 받은 토큰과 사용자 정보를 메모리(session)에만 저장
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  session = { accessToken: data.accessToken, user: data.user };
  return data.user;
}
export function canEdit(post) {
  // FE-04: 로그인한 사람의 id와 글쓴이 id가 같을 때만 버튼을 보여 준다.
  // (화면에서만 숨기는 것이고, 진짜 검사는 서버가 한다)
  const me = getSession().user;
  return !!me && me.id === post.authorId;
}
export const api = {
  list: () => request("/posts"),
  detail: (id) => request(`/posts/${id}`),
  create: (input) =>
    request("/posts", { method: "POST", body: JSON.stringify(input) }),
  update: (id, input) =>
    request(`/posts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  me: () => request("/me"),
};
