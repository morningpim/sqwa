// src/components/map/hooks/useMapIdentity.js
import { useMemo, useState } from "react";
import { useAuth } from "../../../auth/AuthProvider";

export function useMapIdentity() {
  const auth = useAuth?.() || {};

  const [mockUid] = useState(() => {
    const key = "mock_uid";
    let uid = sessionStorage.getItem(key);
    if (!uid) {
      uid = "u_" + Math.random().toString(16).slice(2, 8);
      sessionStorage.setItem(key, uid);
    }
    return uid;
  });

  const [mockName, setMockName] = useState(() => {
    const key = "mock_name";
    let name = sessionStorage.getItem(key);
    if (!name) {
      name = `Guest-${Math.random().toString(16).slice(2, 6)}`;
      sessionStorage.setItem(key, name);
    }
    return name;
  });

  const isMock = !auth.uid && !auth.user?.uid;

  const currentUid = isMock ? mockUid : auth.uid || auth.user?.uid;

  const userProfile = useMemo(
    () =>
      auth.profile || {
        name: mockName,
        photoURL: "",
      },
    [auth.profile, mockName]
  );

  return {
    auth,
    isMock,
    currentUid,
    userProfile,
    mockName,
    setMockName,
  };
}
