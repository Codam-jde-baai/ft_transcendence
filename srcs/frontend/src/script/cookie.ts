export function createLoginCookie (id:string, token:string) {

const maxAge:string = "2"
// const domain:string = "http://localhost:5173"
const SameSitePolicy:string = "lax"

// document.cookie = `${id}=${token}; max-age=${maxAge}; path=/; SameSite=${SameSitePolicy}; Secure; HttpOnly;`
document.cookie = `${id}=${token}; max-age=${maxAge}; path=/; SameSite=${SameSitePolicy}; Secure;`

setTimeout(`const cookie = document.cookie
console.log(cookie)`, 3000)

const cookie = document.cookie
console.log(cookie)
}