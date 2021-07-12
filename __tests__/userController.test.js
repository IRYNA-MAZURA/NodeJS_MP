import 'babel-polyfill';
import { createUser, updateUser, findUser, deleteUser, getAutoSuggestUsers, getUserByLogin } from '../src/services/usersService';
import User from '../src/models/User';

jest.mock('../src/models/User');

describe('User controller', () => {
    beforeEach(() => {
        User.findOne = jest.fn().mockResolvedValueOnce({});
        User.update = jest.fn().mockResolvedValueOnce({});
        User.findAll = jest.fn().mockResolvedValueOnce({});
        User.destroy = jest.fn().mockResolvedValueOnce({});
        User.create = jest.fn().mockResolvedValueOnce({});
    });

    test('Should update user record in DB', (done) => {
        createUser({ age: 56, login: 'testLogin2', password: 'dtr46' })
            .then(() => {
                expect(User.findOne).toBeCalledTimes(1);
                done();
            })
    });

    test('Should create user record in DB', (done) => {
        User.findOne = jest.fn().mockResolvedValueOnce(undefined);
        createUser({ age: 56, login: 'testLogin2', password: 'dtr46' })
            .then(() => {
                expect(User.create).toBeCalledTimes(1);
                done();
            })
    });

    test('Should update user record in DB', (done) => {
        updateUser({ age: 56, login: 'testLogin2', password: 'dtr46' })
            .then(() => {
                expect(User.update).toBeCalledTimes(1);
                done();
            })
    });

    test('Should find all users records in DB if parameters were not passed', (done) => {
        findUser()
            .then(() => {
                expect(User.findAll).toBeCalledTimes(1);
                done();
            })
    });

    test('Should find all users records in DB which match the search parameters', (done) => {
        findUser({ age: 56 })
            .then(() => {
                expect(User.findAll).toBeCalledWith({
                    "where": {
                        "age": 56,
                    }
                });
                done();
            })
    });

    test('Should delete user record from DB which match the search parameters', (done) => {
        deleteUser({ age: 56 })
            .then(() => {
                expect(User.destroy).toBeCalledWith({
                    "where": {
                        "age": 56,
                    }
                });
                done();
            })
    });

    test('Should find all users records in DB which login includes substring', (done) => {
        getAutoSuggestUsers('qwerty', 2)
            .then(() => {
                expect(User.findAll).toBeCalledTimes(1);
                done();
            })
    });

    test('Should find all users records in DB which login includes substring', (done) => {
        getUserByLogin('qwerty')
            .then(() => {
                expect(User.findOne).toBeCalledWith({
                    "where": {
                        "login": 'qwerty',
                    }
                });
                done();
            })
    });

});