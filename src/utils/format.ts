/* eslint-disable @typescript-eslint/no-unused-vars */

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Convert to seconds, minutes, hours, days
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Return appropriate string based on difference
    if (diffSecs < 60) {
      return "just now";
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    } else if (diffWeeks < 5) {
      return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
    } else {
      return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
    }
  } catch (error) {
    return "Invalid date";
  }
}

// If you need a function for future dates, here's one:
export function formatRelativeFuture(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    // Only proceed if the date is in the future
    if (diffMs <= 0) return formatRelativeTime(dateString);

    // Convert to seconds, minutes, hours, days
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Return appropriate string based on difference
    if (diffSecs < 60) {
      return "in a few seconds";
    } else if (diffMins < 60) {
      return `in ${diffMins} ${diffMins === 1 ? "minute" : "minutes"}`;
    } else if (diffHours < 24) {
      return `in ${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
    } else if (diffDays < 7) {
      return `in ${diffDays} ${diffDays === 1 ? "day" : "days"}`;
    } else if (diffWeeks < 5) {
      return `in ${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"}`;
    } else if (diffMonths < 12) {
      return `in ${diffMonths} ${diffMonths === 1 ? "month" : "months"}`;
    } else {
      return `in ${diffYears} ${diffYears === 1 ? "year" : "years"}`;
    }
  } catch (error) {
    return "Invalid date";
  }
}
