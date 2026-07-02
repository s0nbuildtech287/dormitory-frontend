import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

/**
 * ModalPortal — render children vào #modal-root để thoát khỏi
 * mọi CSS Stacking Context của Sidebar / Header.
 * Dùng thay cho <div className="fixed inset-0 ..."> trong mọi Modal.
 */
const ModalPortal = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Khi modal mở, chặn scroll body
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById("modal-root");
  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <div style={{ pointerEvents: "auto" }}>{children}</div>,
    portalRoot
  );
};

export default ModalPortal;
