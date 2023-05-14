interface Config {
    ACCOUNTS_API_URL: string;
    RTC_API_URL: string;
    FILES_API_URL: string;
    POSTS_API_URL: string;
}

const Development: Config = {
    ACCOUNTS_API_URL: "http://localhost:5000",
    FILES_API_URL: "http://localhost:5001",
    POSTS_API_URL: "http://localhost:5002",
    RTC_API_URL: "http://localhost:5003",
};

const Production: Config = {
    ACCOUNTS_API_URL: "https://accounts.snaveware.com",
    FILES_API_URL: "https://files.snaveware.com",
    POSTS_API_URL: "https://posts.snaveware.com",
    RTC_API_URL: "https://rtc.snaveware.com",
};

let Config = Production;

if (process.env.NODE_ENV == "development") {
    Config = Development;
}

export default Config;
