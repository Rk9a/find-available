"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./info.module.css";

export default function InfoPage() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");

        const isDark =
            savedTheme === "dark" ||
            (!savedTheme &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);

        setDarkMode(isDark);

        document.documentElement.dataset.theme =
            isDark ? "dark" : "light";
    }, []);
    return (
        <main
            className={`${styles.page} ${darkMode ? styles.dark : ""
                }`}
        >
            <div className={styles.container}>
                <Link href="/" className={styles.back}>
                    ← Back to Find Available
                </Link>
                <h1>About Find Available</h1>
                <p>
                    Find Available helps KFUPM students find available
                    classrooms based on the university course schedule.
                </p>

                <section>
                    <h2>How it works</h2>

                    <p>
                        Room schedules are generated from publicly available
                        KFUPM Banner registration data. The schedule is
                        periodically synchronized so that changes to sections,
                        rooms, and meeting times can be reflected in the app.
                    </p>
                </section>

                <section>
                    <h2>Found a bug?</h2>

                    <p>
                        If a room schedule looks incorrect, a room is missing,
                        or something in the website is not working, you can
                        report it on GitHub.
                    </p>

                    <a
                        href="https://github.com/Rk9a/find-available/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.reportButton}
                    >
                        Report an issue
                    </a>
                </section>
                <section>
                    <h2>Contact Us</h2>
                    <a
                        href="https://t.me/rk9ax"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.reportButton}
                    >
                        Telegram
                    </a>

                </section>

                <section>
                    <h2>Disclaimer</h2>

                    <p>
                        Find Available is an independent project and is not an
                        official KFUPM service. Room and schedule information
                        ultimately depends on data published through KFUPM
                        Banner.
                    </p>
                </section>
            </div>
        </main>
    );
}