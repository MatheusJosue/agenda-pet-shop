"use client";

import { useEffect } from "react";
import { useHeaderAction } from "./header-context";

interface SetHeaderActionProps {
  action: React.ReactNode;
}

export function SetHeaderAction({ action }: SetHeaderActionProps) {
  const { setAction } = useHeaderAction();

  useEffect(() => {
    setAction(action);
    return () => setAction(null);
  }, [action, setAction]);

  return null;
}
