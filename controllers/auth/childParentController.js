import Joi from "joi";
import { getCount, getData, insertData } from '../../config/index.js';
import { imageUpload, paginationQuery, commonFuction } from '../../helper/index.js';
import CustomErrorHandler from "../../service/CustomErrorHandler.js";

const childParentController = {

    async getChildData(req, res, next) {
        // varibles
        let query = 'SELECT child.*,`parents`.`syncher` as `p_syncher`,`parents`.`created` as `p_create`,`parents`.`update` AS `p_updated` FROM `child`,`parents` WHERE `child`.pid = `parents`.`pid`';
        let cond = '';
        let page = { pageQuery: '' };

        // validation schema
        const childSchema = Joi.object({
            c_name: Joi.string().allow(''),
            class: Joi.string().allow(''),
            p_name: Joi.string().allow(''),
            phone: Joi.string().allow(''),
            childSyncher: Joi.number().integer(),
            parentSyncher: Joi.number().integer(),
            pagination: Joi.boolean(),
            current_page: Joi.number().integer(),
            per_page_records: Joi.number().integer()
        });

        const { error } = childSchema.validate(req.query);
        if (error) {
            return next(error);
        }

        if (req.query.c_name)
            cond += " AND `child`.c_name LIKE %'" + req.query.c_name + "'%";
        if (req.query.class)
            cond += " AND `child`.class = '" + req.query.class + "'";
        if (req.query.childSyncher)
            cond += " AND `child`.syncher > '" + req.query.childSyncher + "'";
        if (req.query.p_name)
            cond += " AND `parents`.p_name LIKE %'" + req.query.c_name + "'%";
        if (req.query.phone)
            cond += " AND `parents`.phone = '" + req.query.phone + "'";
        if (req.query.parentSyncher)
            cond += " AND `parents`.syncher > '" + req.query.parentSyncher + "'";
        if (req.query.pagination)
            page = await paginationQuery(query + cond, next, req.query.current_page, req.query.per_page_records);


        query += cond + " ORDER BY `child`.`cid` DESC " + page.pageQuery;

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
    async addUpdateChild(req, res, next) {
        // Default Variables
        let query = "";
        let cond = '';
        let image = {};

        // validation schemas
        const childSchema = Joi.object({
            cid: Joi.number().integer(),
            pid: Joi.when('cid', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            c_name: Joi.when('cid', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            std: Joi.when('cid', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            class: Joi.when('cid', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            syncher: Joi.number().integer().required(),
        });

        // image uploads middleware
        await imageUpload(req, res, async function (err) {
            if (err) {
            }

            // syncher query
            let syncher = await getCount("SELECT IF(MAX(`syncher`)IS NULL,1,MAX(`syncher`+1)) AS `syncher` FROM `child`;", next);

            let obj = { ...req.body, ...syncher, ...image }

            const { error } = childSchema.validate(obj);
            if (error) {
                return next(error);
            }

            query = obj && obj.cid ? "UPDATE `child` SET ? WHERE cid ='" + obj.cid + "'" : "INSERT INTO `child` SET ?";

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
        });
    },
    async addUpdateParent(req, res, next) {
        // Default Variables
        let query = "";
        let cond = '';
        let image = {};

        // validation schemas
        const parentSchema = Joi.object({
            pid: Joi.number().integer(),
            p_name: Joi.when('pid', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            phone: Joi.when('pid', {
                is: Joi.number().integer().required(),
                then: Joi.string().length(10).pattern(/^[0-9]+$/),
                otherwise: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
            }),
            adhar: Joi.when('pid', {
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
            let syncher = await getCount("SELECT IF(MAX(`syncher`)IS NULL,1,MAX(`syncher`+1)) AS `syncher` FROM `parents`;", next);

            let obj = { ...req.body, ...syncher, ...image }

            const { error } = parentSchema.validate(obj);
            if (error) {
                return next(error);
            }


            query = obj && obj.pid ? "UPDATE `parents` SET ? WHERE pid ='" + obj.pid + "'" : "INSERT INTO `parents` SET ?";

            await insertData(query, obj, next).then((data) => {
                data.insertId && (obj.pid = data.insertId);
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
    async getLeave(req, res, next) {
        // varibles
        let query = 'SELECT `child`.`c_name`,`parents`.`p_name`,`parents`.`phone`,`child_leave`.* FROM `child`,`parents`,`child_leave` WHERE `child`.`cid` = `child_leave`.`cid`';
        let cond = '';
        let page = { pageQuery: '' };

        // validation schema
        const pickupdropSchema = Joi.object({
            phone: Joi.number().integer(),
            c_name: Joi.string().allow(''),
            p_name: Joi.string().allow(''),
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
            cond += " AND `parents`.`phone` = '" + req.query.phone + "'";
        if (req.query.map_name)
            cond += " AND `child`.`c_name` = '" + req.query.c_name + "'";
        if (req.query.d_name)
            cond += " AND `parents`.`p_name` = '" + req.query.p_name + "'";
        if (req.query.syncher)
            cond += " AND `child_leave`.`syncher` > '" + req.query.syncher + "'";
        if (req.query.pagination)
            page = await paginationQuery(query + cond, next, req.query.current_page, req.query.per_page_records);


        query += cond + " ORDER BY `leave_id` DESC " + page.pageQuery;

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
    async applyLeave(req, res, next) {
        // Default Variables
        let query = "";
        let cond = '';
        let image = {};

        // validation schemas
        const leaveApplySchema = Joi.object({
            leave_id: Joi.number().integer(),
            cid: Joi.when('leave_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            pid: Joi.when('leave_id', {
                is: Joi.number().integer().required(),
                then: Joi.number().integer(),
                otherwise: Joi.number().integer().required(),
            }),
            from_date: Joi.when('leave_id', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            to_date: Joi.when('leave_id', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            reason: Joi.when('leave_id', {
                is: Joi.number().integer().required(),
                then: Joi.string().allow(''),
                otherwise: Joi.string().allow('').required(),
            }),
            status: Joi.when('leave_id', {
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
            let syncher = await getCount("SELECT IF(MAX(`syncher`)IS NULL,1,MAX(`syncher`+1)) AS `syncher` FROM `child_leave`;", next);

            let obj = { ...req.body, ...syncher, ...image }

            const { error } = leaveApplySchema.validate(obj);
            if (error) {
                return next(error);
            }


            query = obj && obj.leave_id ? "UPDATE `child_leave` SET ? WHERE leave_id ='" + obj.leave_id + "'" : "INSERT INTO `child_leave` SET ?";

            await insertData(query, obj, next).then((data) => {
                data.insertId && (obj.leave_id = data.insertId);
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

export default childParentController;