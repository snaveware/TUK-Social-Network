interface ConfigKeys {
  API_URL: string;
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
  API_URL: "https://tuksocial.snaveware.com",
};

if (environment == "development") {
  Config = {
    API_URL: "http://192.168.1.101:5000",
  };
}

console.log("configs: ", Config);

export default Config;
