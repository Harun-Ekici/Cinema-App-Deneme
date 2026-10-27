import { Component, type ErrorInfo, type ReactNode } from "react";

interface AdminErrorBoundaryProps {
  children: ReactNode;
}

interface AdminErrorBoundaryState {
  error: Error | null;
}

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  state: AdminErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Yönetim ekranı oluşturulamadı.", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="admin-state-card admin-state-card--error" role="alert">
          <strong>Bu ekran görüntülenemedi</strong>
          <span>{this.state.error.message || "Beklenmeyen bir ekran hatası oluştu."}</span>
          <span>Başka bir yönetim sekmesine geçerek devam edebilirsiniz.</span>
        </div>
      );
    }
    return this.props.children;
  }
}
