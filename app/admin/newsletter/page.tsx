"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Send,
    Save,
    Mail,
    Users,
    CheckCircle,
    XCircle,
    Loader2,
    Eye,
} from "lucide-react";

interface Newsletter {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

interface Subscriber {
    id: string;
    email: string;
    subscribed_at: string;
    is_active: boolean;
}

export default function AdminNewsletterPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0 });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    // Załaduj newsletter i subskrybentów
    useEffect(() => {
        fetchNewsletter();
        fetchSubscribers();
    }, []);

    const fetchNewsletter = async () => {
        try {
            const response = await fetch("/api/admin/newsletter");
            const data = await response.json();

            if (data.newsletter) {
                setNewsletter(data.newsletter);
                setTitle(data.newsletter.title);
                setContent(data.newsletter.content);
            }
        } catch (error) {
            console.error("Failed to fetch newsletter:", error);
        }
    };

    const fetchSubscribers = async () => {
        try {
            const response = await fetch("/api/admin/newsletter/subscribers");
            const data = await response.json();

            setSubscribers(data.subscribers || []);
            setStats({
                total: data.total || 0,
                active: data.active || 0,
            });
        } catch (error) {
            console.error("Failed to fetch subscribers:", error);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            setMessage({
                type: "error",
                text: "Please fill in both title and content",
            });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/newsletter", {
                method: newsletter ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: data.message });
                setNewsletter(data.newsletter);
            } else {
                setMessage({ type: "error", text: data.error });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to save newsletter" });
        } finally {
            setSaving(false);
        }
    };

    const handleSendTest = async () => {
        if (!newsletter) {
            setMessage({
                type: "error",
                text: "Please save the newsletter first",
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch("/api/newsletter/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Dodaj swój sekret autoryzacji jeśli jest wymagany
                },
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: "success",
                    text: `Newsletter sent to ${data.sent} subscribers!`,
                });
            } else {
                setMessage({ type: "error", text: data.error });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to send newsletter" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Newsletter Management
                    </h1>
                    <p className="text-gray-600">
                        Create and manage your daily newsletter content
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Subscribers
                            </CardTitle>
                            <Users className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                All newsletter subscribers
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Subscribers
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.active}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                Will receive the newsletter
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Unsubscribed
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {stats.total - stats.active}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                Opted out of newsletter
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Newsletter Editor */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Newsletter Editor
                                </CardTitle>
                                <CardDescription>
                                    Create or update the newsletter content
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Newsletter Title
                                    </label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder="Enter newsletter title..."
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="content"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Content (HTML supported)
                                    </label>
                                    <Textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) =>
                                            setContent(e.target.value)
                                        }
                                        placeholder="Enter newsletter content... You can use HTML tags for formatting."
                                        rows={12}
                                        className="w-full font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tip: Use HTML tags like &lt;p&gt;,
                                        &lt;strong&gt;, &lt;a&gt; for formatting
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Newsletter
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={handleSendTest}
                                        disabled={loading || !newsletter}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Now
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Status Messages */}
                                {message && (
                                    <div
                                        className={`p-4 rounded-lg ${
                                            message.type === "success"
                                                ? "bg-green-50 text-green-800 border border-green-200"
                                                : "bg-red-50 text-red-800 border border-red-200"
                                        }`}
                                    >
                                        {message.text}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        {newsletter && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Current Newsletter
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="font-semibold text-lg mb-2">
                                            {newsletter.title}
                                        </h3>
                                        <div
                                            className="text-sm text-gray-700 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: newsletter.content,
                                            }}
                                        />
                                        <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
                                            Last updated:{" "}
                                            {new Date(
                                                newsletter.updated_at
                                            ).toLocaleString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Subscribers List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Subscribers ({subscribers.length})
                            </CardTitle>
                            <CardDescription>
                                List of all newsletter subscribers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[800px] overflow-y-auto">
                                {subscribers.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No subscribers yet</p>
                                    </div>
                                ) : (
                                    subscribers.map((subscriber) => (
                                        <div
                                            key={subscriber.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-gray-900">
                                                    {subscriber.email}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Subscribed:{" "}
                                                    {new Date(
                                                        subscriber.subscribed_at
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    subscriber.is_active
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {subscriber.is_active
                                                    ? "Active"
                                                    : "Unsubscribed"}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Instructions */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-900">
                            🔔 Automation Setup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-900">
                        <p className="mb-4">
                            To automate newsletter sending, set up a CRON job at{" "}
                            <a
                                href="https://console.cron-job.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold underline"
                            >
                                console.cron-job.org
                            </a>
                        </p>
                        <div className="bg-white p-4 rounded border border-blue-200 font-mono text-xs">
                            <p className="mb-2">
                                <strong>URL:</strong>{" "}
                                https://your-domain.com/api/newsletter/send
                            </p>
                            <p className="mb-2">
                                <strong>Method:</strong> POST
                            </p>
                            <p>
                                <strong>Schedule:</strong> Daily at 9:00 AM (0 9
                                * * *)
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
