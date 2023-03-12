import Joi from "joi";
import { getCount, getData, insertData } from '../../config/index.js';
import { imageUpload, paginationQuery, commonFuction } from '../../helper/index.js';
import CustomErrorHandler from "../../service/CustomErrorHandler.js";

const busController = {

    async getBusData(req, res, next) {
        // varibles
        let query = 'SELECT `bus`.*,`map`.`map_name` FROM `bus`,`map` WHERE `bus`.`map_id` = `map`.`map_id`';
        let cond = '';
        let page = { pageQuery: '' };

        // validation schema
        const busSchema = Joi.object({
            busName: Joi.string().allow(''),
            busNumber: Joi.string().allow(''),
            syncher: Joi.number().integer(),
            pagination: Joi.boolean(),
            current_page: Joi.number().integer(),
            per_page_records: Joi.number().integer()
        });

        const { error } = busSchema.validate(req.query);
        if (error) {
            return next(error);
        }

        if (req.query.busName)
            cond += " AND busName = '" + req.query.busName + "'";
        if (req.query.busNumber)
            cond += " AND busNumber = '" + req.query.busNumber + "'";
        if (req.query.syncher)
            cond += " AND syncher > '" + req.query.syncher + "'";
        if (req.query.pagination)
            page = await paginationQuery(query + cond, next, req.query.current_page, req.query.per_page_records);


        query += cond + " ORDER BY `bid` DESC " + page.pageQuery;

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
    async addUpdateBus(req, res, next) {
        // Default Variables
        let query = "";
        let cond = '';
        let image = {};

        // validation schemas
        const animalSchema = Joi.object({
            bid: Joi.number().integer(),
            map_id: Joi.string().required(),
            busName: Joi.string().allow(''),
            busNumber: Joi.string().allow('').required(),
            b_seat: Joi.number().integer(),
            syncher: Joi.number().integer().required(),
        });

        // image uploads middleware
        await imageUpload(req, res, async function (err) {
            if (err) {
            }

            // syncher query
            let syncher = await getCount("SELECT IF(MAX(`syncher`)IS NULL,1,MAX(`syncher`+1)) AS `syncher` FROM `bus`;", next);

            let obj = { ...req.body, ...syncher, ...image }

            const { error } = animalSchema.validate(obj);
            if (error) {
                return next(error);
            }

            let validationQuery = "SELECT busNumber FROM bus WHERE busNumber='" + req.body.busNumber + "' " + cond;
            await getData(validationQuery, next).then(async (data) => {
                if (data.length > 0 && !obj.bid) {
                    return next(CustomErrorHandler.alreadyExist("Data Already exist"));
                } else {
                    query = obj && obj.bid ? "UPDATE `bus` SET ? WHERE bid ='" + obj.bid + "'" : "INSERT INTO `bus` SET ?";

                    await insertData(query, obj, next).then((data) => {
                        data.insertId && (obj.bid = data.insertId);
                        res.json(
                            {
                                message: obj && !data.insertId ? "Data Updated Successfully" : "Data Inserted Successfully",
                                data: obj,
                            }
                        )
                    }).catch((err) => {
                        next(err)
                    });
                }
            });
        });
    },
}

export default busController;