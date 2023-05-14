interface ConfigKeys {
    ACCOUNTS_API_URL?: string;
    RTC_API_URL?: string;
    FILES_API_URL?: string;
    POSTS_API_URL?: string;
}

const environment = process.env.NODE_ENV;

console.log("environment = ", environment);

// const Config: ConfigKeys = {
//     ACCOUNTS_API_URL: process.env.ACCOUNTS_API_URL,
//     FILES_API_URL: process.env.FILES_API_URL,
//     POSTS_API_URL: process.env.POSTS_API_URL,
//     RTC_API_URL: process.env.RTC_API_URL,
// };

let Config: ConfigKeys = {
    ACCOUNTS_API_URL: "https://account.snaveware.com",
    POSTS_API_URL: "https://posts.snaveware.com",
    FILES_API_URL: "https://files.snaveware.com",
    RTC_API_URL: "https://rtc.snaveware.com",
};

if (environment == "development") {
    Config = {
        ACCOUNTS_API_URL: "http://192.168.1.100:5000",
        POSTS_API_URL: "http://192.168.1.100:5001",
        FILES_API_URL: "http://192.168.1.100:5002",
        RTC_API_URL: "http://192.168.1.100:5003",
    };
}

console.log("configs: ", Config);

export default Config;
