import express from 'express';
import db from '../data-access/db';
import { createValidator } from 'express-joi-validation';
import { createGroup, updateGroup, findAllGroups, deleteGroup, addUsersToGroup } from '../services/groupServices';
import { bodySchema, querySchema, paramsSchema } from '../services/groupValidation';
import { logServiceError } from '../services/logServiceMiddleware';
import { checkToken } from '../helpers/authorizationHelper';

const router = express.Router();
const validator = createValidator();

router.route('/')
    .get(checkToken, (req, res, next) => findAllGroups()
        .then(groups => res.send(groups))
        .catch(() => {
            logServiceError({ message: 'Groups were not found!' }, req, res, next);
        })
    )

    .post(checkToken, validator.body(bodySchema), (req, res, next) => {
        createGroup(req.body)
            .then((gr) => res.send(gr))
            .catch(() => {
                logServiceError({ message: 'Group was not created!' }, req, res, next);
            });
    });

router.route('/:id')
    .get(checkToken, (req, res, next) => {
        findAllGroups({ id: req.params.id })
            .then((group) => res.send(group))
            .catch(() => {
                logServiceError({ message: 'Group was not found!' }, req, res, next);
            });
    })
    .put(checkToken, validator.body(bodySchema), (req, res, next) => {
        const { params, body } = req;
        updateGroup(body, { id: params.id })
            .then(() => res.send(`Group with ID = ${req.params.id} was updated.`))
            .catch(() => {
                logServiceError({ message: 'Group was not updated!' }, req, res, next);
            });
    })
    .delete(checkToken, (req, res, next) => {
        deleteGroup({ id: req.params.id })
            .then(() => res.send(`Group with ID = ${req.params.id} was deleted.`))
            .catch(() => {
                logServiceError({ message: 'Group was not deleted!' }, req, res, next);
            });
    })
    .post(validator.query(querySchema), validator.params(paramsSchema), checkToken, (req, res, next) => {
        const userIds = req.query.userId;
        const groupId = req.params.id;

        db.transaction().then((t) => {
            addUsersToGroup(groupId, userIds, { transaction: t })
                .then(group => res.status(201).json({
                    message: `The new users were added to group #${groupId}`,
                    content: group
                }))
                .then(() => t.commit())
                .catch(() => {
                    logServiceError({ message: 'Users were not added to group!' }, req, res, next);
                    return t.rollback();
                });
        });
    });

export default router;
