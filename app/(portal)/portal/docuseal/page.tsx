"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSignature, ExternalLink, FileText, Clock, CheckCircle } from "lucide-react";

export default function DocuSealPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DocuSeal</h1>
          <p className="text-muted-foreground">
            Document signing and management
          </p>
        </div>
        <Button asChild>
          <a href="https://docuseal.co" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open DocuSeal
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Documents awaiting signature
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Signed documents this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Document templates available
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Document Signing Integration
          </CardTitle>
          <CardDescription>
            DocuSeal integration for electronic document signing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground mb-4">
              DocuSeal provides a secure and efficient way to sign documents electronically. 
              Use this integration to send documents for signature, track signing progress, 
              and manage completed agreements.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://docuseal.co/docs" target="_blank" rel="noopener noreferrer">
                  View Documentation
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://docuseal.co/templates" target="_blank" rel="noopener noreferrer">
                  Manage Templates
                </a>
              </Button>
            </div>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <FileSignature className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents pending signature</p>
            <p className="text-sm">Documents sent for signature will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
