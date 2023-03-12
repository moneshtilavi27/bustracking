import Joi from "joi";
import { getCount, getData, insertData } from '../../config/index.js';
import { imageUpload, paginationQuery, commonFuction } from '../../helper/index.js';
import CustomErrorHandler from "../../service/CustomErrorHandler.js";

const busController = {

    async getmapData(req, res, next) {
        // varibles
        let query = 'SELECT * FROM `map` WHERE 1';
        let cond = '';
        let page = { pageQuery: '' };

        // validation schema
        const mapSchema = Joi.object({
            map_name: Joi.string().allow(''),
            syncher: Joi.number().integer(),
        });

        const { error } = mapSchema.validate(req.query);
        if (error) {
            return next(error);
        }

        if (req.query.map_name)
            cond += " AND map_name = '" + req.query.map_name + "'";
        if (req.query.syncher)
            cond += " AND syncher > '" + req.query.syncher + "'";
        if (req.query.pagination)
            page = await paginationQuery(query + cond, next, req.query.current_page, req.query.per_page_records);


        query += cond + " ORDER BY `map_id` DESC " + page.pageQuery;

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
    async addUpdateMap(req, res, next) {
        // Default Variables
        let query = "";
        let cond = '';
        let image = {};

        // validation schemas
        const mapSchema = Joi.object({
            map_id: Joi.number().integer(),
            map_name: Joi.string().allow(''),
            syncher: Joi.number().integer(),
        });

        // image uploads middleware
        await imageUpload(req, res, async function (err) {
            if (err) {
            }

            // syncher query
            let syncher = await getCount("SELECT IF(MAX(`syncher`)IS NULL,1,MAX(`syncher`+1)) AS `syncher` FROM `map`;", next);

            let obj = { ...req.body, ...syncher, ...image }

            const { error } = mapSchema.validate(obj);
            if (error) {
                return next(error);
            }


            query = obj && obj.map_id ? "UPDATE `map` SET ? WHERE map_id ='" + obj.map_id + "'" : "INSERT INTO `map` SET ?";

            await insertData(query, obj, next).then((data) => {
                data.insertId && (obj.map_id = data.insertId);
                res.json(
                    {
                        message: obj && !data.insertId ? "Data Updated Successfully" : "Data Inserted Successfully",
                        data: obj,
                    }
                )
            }).catch((err) => {
                next(err)
            });
        });
    },
    async getCheckPoints(req, res, next) {
        // varibles
        let query = 'SELECT `child`.`c_name`,`parents`.`p_name`,`parents`.`phone`,`map`.`map_name`,`checkpoints`.* FROM `checkpoints`,`map`,`child`,`parents` WHERE `child`.`cid`=`checkpoints`.`cid` AND `checkpoints`.`pid`=`parents`.`pid` AND `checkpoints`.`map_id`=`map`.`map_id`';
        let cond = '';
        let page = { pageQuery: '' };

        // validation schema
        const checkpointsSchema = Joi.object({
            phone: Joi.number().integer(),
            map_name: Joi.string().allow(''),
            syncher: Joi.number().integer(),
            pagination: Joi.boolean(),
            current_page: Joi.number().integer(),
            per_page_records: Joi.number().integer()
        });

        const { error } = checkpointsSchema.validate(req.query);
        if (error) {
            return next(error);
        }

        if (req.query.phone)
            cond += " AND `parents`.`phone` = '" + req.query.phone + "'";
        if (req.query.map_name)
            cond += " AND `map`.`map_name` = '" + req.query.map_name + "'";
        if (req.query.syncher)
            cond += " AND `checkpoints`.`syncher` > '" + req.query.syncher + "'";
        if (req.query.pagination)
            page = await paginationQuery(query + cond, next, req.query.current_page, req.query.per_page_records);


        query += cond + " ORDER BY `pick_id` DESC " + page.pageQuery;

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
    async addUpdateChechPoints(req, res, next) {
        // Default Variables
        let query = "";
        let cond = '';
        let image = {};

        // validation schemas
        const checkpointsSchema = Joi.object({
            pick_id: Joi.number().integer(),
            map_id: Joi.when('pick_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            cid: Joi.when('pick_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            pid: Joi.when('pick_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            main_adress: Joi.when('pick_id', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            alter_adress: Joi.string().allow(''),
            prime_adress: Joi.string().allow(''),
            package: Joi.when('pick_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            syncher: Joi.number().integer().required(),
        });

        // image uploads middleware
        await imageUpload(req, res, async function (err) {
            if (err) {
            }

            // syncher query
            let syncher = await getCount("SELECT IF(MAX(`syncher`)IS NULL,1,MAX(`syncher`+1)) AS `syncher` FROM `checkpoints`;", next);

            let obj = { ...req.body, ...syncher, ...image }

            const { error } = checkpointsSchema.validate(obj);
            if (error) {
                return next(error);
            }

            let validationQuery = "SELECT `pick_id` FROM `checkpoints` WHERE `map_id`='" + req.body.map_id + "' AND `cid`='" + req.body.cid + "' AND `pid`='" + req.body.pid + "'" + cond;
            await getData(validationQuery, next).then(async (data) => {
                if (data.length > 0 && !obj.pick_id) {
                    return next(CustomErrorHandler.alreadyExist("Data Already exist"));
                } else {
                    query = obj && obj.did ? "UPDATE `checkpoints` SET ? WHERE pick_id ='" + obj.pick_id + "'" : "INSERT INTO `checkpoints` SET ?";

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
    },
    async getPickupDrop(req, res, next) {
        // varibles
        let query = 'SELECT `map`.`map_name`,`driver`.`d_name`,`driver`.`phone`,`pickupdrop`.* FROM `pickupdrop`,`driver`,`map` WHERE `map`.`map_id`=`pickupdrop`.`map_id` AND `driver`.`did` = `pickupdrop`.`did`';
        let cond = '';
        let page = { pageQuery: '' };

        // validation schema
        const pickupdropSchema = Joi.object({
            phone: Joi.number().integer(),
            map_name: Joi.string().allow(''),
            d_name: Joi.string().allow(''),
            syncher: Joi.number().integer(),
            pagination: Joi.boolean(),
            current_page: Joi.number().integer(),
            per_page_records: Joi.number().integer()
        });

        const { error } = pickupdropSchema.validate(req.query);
        if (error) {
            return next(error);
        }

        if (req.query.phone)
            cond += " AND `driver`.`phone` = '" + req.query.phone + "'";
        if (req.query.map_name)
            cond += " AND `map`.`map_name` = '" + req.query.map_name + "'";
        if (req.query.d_name)
            cond += " AND `driver`.`d_name` = '" + req.query.d_name + "'";
        if (req.query.syncher)
            cond += " AND `pickupdrop`.`syncher` > '" + req.query.syncher + "'";
        if (req.query.pagination)
            page = await paginationQuery(query + cond, next, req.query.current_page, req.query.per_page_records);


        query += cond + " ORDER BY `pd_id` DESC " + page.pageQuery;

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
    async addUpdatePickupDrop(req, res, next) {
        // Default Variables
        let query = "";
        let cond = '';
        let image = {};

        // validation schemas
        const pickUpDropSchema = Joi.object({
            pd_id: Joi.number().integer(),
            map_id: Joi.when('pd_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            cid: Joi.when('pd_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            did: Joi.when('pd_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            location: Joi.when('pd_id', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            type: Joi.when('pick_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            syncher: Joi.number().integer().required(),
        });

        // image uploads middleware
        await imageUpload(req, res, async function (err) {
            if (err) {
            }

            // syncher query
            let syncher = await getCount("SELECT IF(MAX(`syncher`)IS NULL,1,MAX(`syncher`+1)) AS `syncher` FROM `pickupdrop`;", next);

            let obj = { ...req.body, ...syncher, ...image }

            const { error } = pickUpDropSchema.validate(obj);
            if (error) {
                return next(error);
            }


            query = obj && obj.pd_id ? "UPDATE `pickupdrop` SET ? WHERE pd_id ='" + obj.pd_id + "'" : "INSERT INTO `pickupdrop` SET ?";

            await insertData(query, obj, next).then((data) => {
                data.insertId && (obj.pd_id = data.insertId);
                res.json({
                    message: obj && !data.insertId ? "Data Updated Successfully" : "Data Inserted Successfully",
                    data: obj,
                });
            }).catch((err) => {
                next(err);
            });
        });
    }

}

export default busController;