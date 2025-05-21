const ip = require("ip");
let os = require("os");

module.exports = {
  getIpAddress: () => {
    let ipAddress = "https://www.domain.com";
    try {
      let networkInterfaces = os.networkInterfaces();
      const ipV4 = networkInterfaces["Wi-Fi"].find((e) => (e.family = "IPv4"));
      ipAddress = ip.address().includes("192") ? ip.address() : ipV4.address;
      ipAddress = `http://${ipAddress}`;
    } catch (error) {
      ipAddress = ip.address();
      ipAddress = `https://${ipAddress}`;
    }
    return ipAddress;
  },
};
