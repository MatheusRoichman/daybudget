"use client";

import { useEffect } from "react";

export function TimezoneSync() {
	useEffect(() => {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		document.cookie = `tz=${tz};path=/;max-age=31536000;samesite=strict`;
	}, []);
	return null;
}
