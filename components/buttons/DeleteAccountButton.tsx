"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import MainButton from "./MainButton";

export default function DeleteAccountButton() {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isConfirmValid = confirmText.toLowerCase() === "potwierdzam";

    async function handleDelete() {
        if (!isConfirmValid) return;

        setLoading(true);
        try {
            const res = await fetch("/api/user/delete-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Błąd usuwania konta");
            }

            toast.success("Konto zostało usunięte", {
                description: "Wszystkie dane i pliki zostały trwale usunięte",
            });

            // Przekieruj na stronę główną po 1 sekundzie
            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch (e: any) {
            toast.error("Nie udało się usunąć konta", {
                description: e.message,
            });
            setLoading(false);
        }
    }

    function handleDialogClose(open: boolean) {
        setConfirmDelete(open);
        if (!open) {
            setConfirmText("");
        }
    }

    return (
        <>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900 mb-2">
                            Strefa niebezpieczna
                        </h3>
                        <p className="text-sm text-red-700 mb-4">
                            Usunięcie konta jest{" "}
                            <strong>trwałe i nieodwracalne</strong>. Zostaną
                            usunięte:
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1 mb-4">
                            <li>Wszystkie Twoje zdjęcia i kolekcje</li>
                            <li>Galerie publiczne i linki</li>
                            <li>Historia płatności</li>
                            <li>Aktywna subskrypcja (zostanie anulowana)</li>
                            <li>Dane profilu i avatar</li>
                        </ul>

                        <MainButton
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => setConfirmDelete(true)}
                            loading={loading}
                            loadingText="Usuwanie..."
                            variant="danger"
                            label="Usuń konto na zawsze"
                        />
                    </div>
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={handleDialogClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Czy na pewno usunąć konto?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <p>
                                Ta operacja jest <strong>nieodwracalna</strong>.
                                Wszystkie Twoje dane, zdjęcia, kolekcje i
                                subskrypcja zostaną trwale usunięte. Nie będzie
                                możliwości odzyskania tych danych.
                            </p>
                            <div className="space-y-2 ">
                                <p className="text-sm font-medium text-gray-900 ">
                                    Wpisz{" "}
                                    <b className="text-black font-semibold">
                                        "potwierdzam"
                                    </b>{" "}
                                    aby kontynuować:
                                </p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) =>
                                        setConfirmText(e.target.value)
                                    }
                                    placeholder="potwierdzam"
                                    className="w-full px-3 py-2 border mt-4 border-gray-300 text-black rounded-lg focus:ring focus:ring-red-500 focus:border-red-500 outline-none"
                                    autoComplete="off"
                                />
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>
                            Anuluj
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={!isConfirmValid || loading}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Usuwanie..." : "Tak, usuń wszystko"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
