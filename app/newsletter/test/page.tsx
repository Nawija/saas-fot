"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Send, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function NewsletterTestPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSendNewsletter = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/newsletter/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            setResult({ success: response.ok, data });
        } catch (error: any) {
            setResult({ success: false, data: { error: error.message } });
        } finally {
            setLoading(false);
        }
    };

    const handleTestSubscribe = async () => {
        const testEmail = `test-${Date.now()}@example.com`;

        try {
            const response = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: testEmail }),
            });

            const data = await response.json();
            alert(response.ok ? `✅ ${data.message}` : `❌ ${data.error}`);
        } catch (error: any) {
            alert(`❌ Error: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Newsletter Testing
                </h1>

                {/* Test Subscribe */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Subscription</CardTitle>
                        <CardDescription>
                            Add a test subscriber to the database
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleTestSubscribe}>
                            Add Test Subscriber
                        </Button>
                    </CardContent>
                </Card>

                {/* Send Newsletter */}
                <Card>
                    <CardHeader>
                        <CardTitle>Send Newsletter</CardTitle>
                        <CardDescription>
                            Trigger newsletter sending to all active subscribers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleSendNewsletter}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending Newsletter...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Newsletter Now
                                </>
                            )}
                        </Button>

                        {result && (
                            <div
                                className={`p-4 rounded-lg border ${
                                    result.success
                                        ? "bg-green-50 border-green-200"
                                        : "bg-red-50 border-red-200"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {result.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <h3
                                            className={`font-semibold mb-2 ${
                                                result.success
                                                    ? "text-green-900"
                                                    : "text-red-900"
                                            }`}
                                        >
                                            {result.success
                                                ? "Success!"
                                                : "Error"}
                                        </h3>
                                        <pre
                                            className={`text-sm overflow-auto ${
                                                result.success
                                                    ? "text-green-800"
                                                    : "text-red-800"
                                            }`}
                                        >
                                            {JSON.stringify(
                                                result.data,
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-900">ℹ️ Info</CardTitle>
                    </CardHeader>
                    <CardContent className="text-blue-900 space-y-2">
                        <p>
                            <strong>Before sending:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>
                                Create a newsletter in admin panel
                                (/admin/newsletter)
                            </li>
                            <li>Add test subscribers using the button above</li>
                            <li>Configure SMTP settings in .env file</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
