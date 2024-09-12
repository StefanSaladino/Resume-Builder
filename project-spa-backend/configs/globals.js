//initialize.env
require("dotenv").config();

//global config obj containing app lvl variables
//client secrets, API keys, db connection strings, etc
const globals = {
    ConnectionString: {
        MongoDB: process.env.CONNECTION_STRING_MONGODB,
    },
    
}

//export config obj
module.exports = globals;