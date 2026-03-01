/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the app and provides fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Bug, ExternalLink } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: new Date().getTime().toString()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // In production, you would send this to your error reporting service
    this.logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  private generateErrorId = (): string => {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Integrate with your error reporting service (e.g., Sentry, Bugsnag)
    // For now, we'll just log to console
    console.error('Application Error:', {
      errorId: this.state.errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: this.generateErrorId()
    });
  };

  private handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Create GitHub issue URL (replace with your repository URL)
    const issueTitle = `Error Report: ${this.state.error?.message || 'Unknown Error'}`;
    const issueBody = `**Error ID:** ${this.state.errorId}\n\n**Error Message:**\n\`\`\`\n${this.state.error?.message}\n\`\`\`\n\n**Stack Trace:**\n\`\`\`\n${this.state.error?.stack}\n\`\`\`\n\n**Additional Info:**\n- Timestamp: ${errorDetails.timestamp}\n- URL: ${errorDetails.url}\n- User Agent: ${errorDetails.userAgent}`;
    
    const githubUrl = `https://github.com/your-username/escrowx/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;
    window.open(githubUrl, '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <CardTitle className="text-2xl">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Application Error</AlertTitle>
                <AlertDescription>
                  An unexpected error occurred while running the application. 
                  This has been logged for investigation.
                </AlertDescription>
              </Alert>

              {import.meta.env.DEV && this.state.error && (
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertTitle>Development Error Details</AlertTitle>
                  <AlertDescription className="font-mono text-sm mt-2">
                    <strong>Error:</strong> {this.state.error.message}<br />
                    <strong>Error ID:</strong> {this.state.errorId}
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p>
                  <strong>Time:</strong> {new Date().toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={this.handleReload} className="flex-1 sm:flex-none">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleReset} 
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReportBug}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Report Bug
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t">
                If this problem persists, please contact support with Error ID: <code>{this.state.errorId}</code>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;