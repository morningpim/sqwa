import { mockUsers } from "./users";

export function mockLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        u => u.email === email && u.password === password
      );

      if (user) {
        resolve({
          success: true,
          user
        });
      } else {
        reject({
          success: false,
          message: "Invalid email or password"
        });
      }
    }, 800); // delay ให้เหมือนเรียก API
  });
}
