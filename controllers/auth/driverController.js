import Joi from "joi";
import { getCount, getData, insertData } from "../../config";
import { imageUpload, paginationQuery } from "../../helper";
import { CustomErrorHandler } from "../../service";

const driverController = {
    async getDriver(req, res, next) {
        // varibles
        let query = 'SELECT * FROM `driver` WHERE 1';
        let cond = '';
        let page = { pageQuery: '' };

        // validation schema
        const driverSchema = Joi.object({
            d_name: Joi.string().allow(''),
            phone: Joi.number().integer(),
            lienceNo: Joi.string().allow(''),
            adharNo: Joi.number().integer(),
            syncher: Joi.number().integer(),
            pagination: Joi.boolean(),
            current_page: Joi.number().integer(),
            per_page_records: Joi.number().integer()
        });

        const { error } = driverSchema.validate(req.query);
        if (error) {
            return next(error);
        }

        if (req.query.busName)
            cond += " AND d_name LIKE  %'" + req.query.d_name + "'%";
        if (req.query.phone)
            cond += " AND phone = '" + req.query.phone + "'";
        if (req.query.lienceNo)
            cond += " AND lienceNo = '" + req.query.lienceNo + "'";
        if (req.query.adharNo)
            cond += " AND adharNo = '" + req.query.adharNo + "'";
        if (req.query.syncher)
            cond += " AND syncher > '" + req.query.syncher + "'";
        if (req.query.pagination)
            page = await paginationQuery(query + cond, next, req.query.current_page, req.query.per_page_records);


        query += cond + " ORDER BY `did` DESC " + page.pageQuery;

        await getData(query, next).then(async (data) => {
            res.json({
                message: 'success',
                total_records: page.total_rec ? page.total_rec : data.length,
                number_of_pages: page.number_of_pages,
                currentPage: page.currentPage,
                records: data.length,
                data: data,
            });
        });
    },
    async addUpdateDriver(req, res, next) {
        // Default Variables
        let query = "";
        let cond = '';
        let image = {};

        // validation schemas
        const driverSchema = Joi.object({
            did: Joi.number().integer(),
            d_name: Joi.when('did', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            phone: Joi.when('did', {
                is: Joi.number().integer().required(),
                then: Joi.string().length(10).pattern(/^[0-9]+$/),
                otherwise: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
            }),
            address: Joi.when('did', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            lience: Joi.when('did', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            lienceNo: Joi.when('did', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            adharNo: Joi.when('did', {
                is: Joi.number().integer().required(),
                then: Joi.string().length(15).pattern(/^[0-9]+$/),
                otherwise: Joi.string().length(15).pattern(/^[0-9]+$/).required(),
            }),
            syncher: Joi.number().integer().required(),
        });

        // image uploads middleware
        await imageUpload(req, res, async function (err) {
            if (err) {
            }

            // syncher query
            let syncher = await getCount("SELECT IF(MAX(`syncher`)IS NULL,1,MAX(`syncher`+1)) AS `syncher` FROM `driver`;", next);

            let obj = { ...req.body, ...syncher, ...image }

            const { error } = driverSchema.validate(obj);
            if (error) {
                return next(error);
            }

            let validationQuery = "SELECT phone FROM driver WHERE phone ='" + req.body.phone + "' " + cond;
            await getData(validationQuery, next).then(async (data) => {
                if (data.length > 0 && !obj.bid) {
                    return next(CustomErrorHandler.alreadyExist("Data Already exist"));
                } else {
                    query = obj && obj.did ? "UPDATE `driver` SET ? WHERE did ='" + obj.did + "'" : "INSERT INTO `driver` SET ?";

                    await insertData(query, obj, next).then((data) => {
                        data.insertId && (obj.did = data.insertId);
                        res.json({
                                message: obj && !data.insertId ? "Data Updated Successfully" : "Data Inserted Successfully",
                                data: obj,
                            });
                    }).catch((err) => {
                        next(err);
                    });
                }
            });
        });
    }
}

export default driverController;