"use client";

import Link from "next/link";
import { ArrowLeft, Bug, Send } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function InfoPage() {
    // Keeps html[data-theme] in sync when this page is opened directly.
    useDarkMode();

    return (
        <div className="px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-[760px]">
                <Button
                    asChild
                    variant="ghost"
                    className="mb-8 -ml-2.5 text-muted-foreground"
                >
                    <Link href="/">
                        <ArrowLeft />
                        Back to Find Available
                    </Link>
                </Button>

                <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
                    About Find Available
                </h1>
                <p className="mb-8 leading-relaxed text-muted-foreground">
                    Find Available helps KFUPM students find available
                    classrooms based on the university course schedule.
                </p>

                <div className="flex flex-col gap-4">
                    <Card className="gap-3 py-6 ring-border">
                        <CardHeader className="px-6">
                            <CardTitle className="text-lg font-semibold">
                                How it works
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6">
                            <p className="leading-relaxed text-muted-foreground">
                                Room schedules are generated from publicly available
                                KFUPM Banner registration data. The schedule is
                                periodically synchronized so that changes to sections,
                                rooms, and meeting times can be reflected in the app.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="gap-3 py-6 ring-border">
                            <CardHeader className="px-6">
                                <CardTitle className="text-lg font-semibold">
                                    Found a bug?
                                </CardTitle>
                                <CardDescription className="leading-relaxed">
                                    If a room schedule looks incorrect, a room is missing,
                                    or something in the website is not working, you can
                                    report it on GitHub.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto px-6">
                                <Button asChild className="h-9 px-4">
                                    <a
                                        href="https://github.com/Rk9a/find-available/issues"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Bug />
                                        Report an issue
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="gap-3 py-6 ring-border">
                            <CardHeader className="px-6">
                                <CardTitle className="text-lg font-semibold">
                                    Contact Us
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="mt-auto px-6">
                                <Button asChild className="h-9 px-4">
                                    <a
                                        href="https://t.me/rk9ax"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Send />
                                        Telegram
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="gap-3 py-6 ring-border">
                        <CardHeader className="px-6">
                            <CardTitle className="text-lg font-semibold">
                                Disclaimer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6">
                            <p className="leading-relaxed text-muted-foreground">
                                Find Available is an independent project and is not an
                                official KFUPM service. Room and schedule information
                                ultimately depends on data published through KFUPM
                                Banner.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
