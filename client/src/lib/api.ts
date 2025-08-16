
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
 
export async function apiRequest<T>(
  method: string,
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    method,
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include' // Important for session-based auth
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('POST', '/api/auth/logout');
    localStorage.removeItem('username');
  } catch (error) {
    // Even if the API call fails, clear local storage
    localStorage.removeItem('username');
    throw error;
  }
}
