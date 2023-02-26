import Joi from "joi";
import bcrypt from 'bcrypt';
import md5 from 'md5'
import { CustomErrorHandler, JwtService } from "../../service/index.js";
import { getData } from "../../config/index.js";

const loginController = {
    async login(req, res, next) {
    
        // validation
        const loginSchema = Joi.object({
            phone: Joi.number().required(),
            // password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            password: Joi.string().required()
        });

        const { error } = loginSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        let query = "SELECT * FROM `addowner` WHERE `phone`='" + req.body.phone + "';";
        await getData(query, next).then(async (data) => {
            if (data.length <= 0) {
                return next(CustomErrorHandler.wrongCredentials());
            } else {
                // const match = await bcrypt.compare(req.body.password, data[0].password);
                const match = md5(req.body.password) === data[0].password ? true : false;
                delete data[0].password;
                if (!match) {
                    return next(CustomErrorHandler.wrongCredentials());
                } else {
                    const accessToken = JwtService.sign({ _id: data[0].id, role: data[0].role });
                    res.json(
                        {
                            message: "User loged in successfully",
                            accessToken,
                            data: data[0]
                        }
                    )
                }
            }
        });

    }
}



export default loginController;