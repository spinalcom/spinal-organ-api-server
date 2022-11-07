/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import { describe, before, it } from 'mocha';
const chai = require('chai');
const chaiHttp = require('chai-http')
import Request from '../../src/index';
chai.should();
chai.use(chaiHttp);


describe('Contexts requests', function () {
  describe('Get context list', function () {
    it('It should get al the contexts', (done) => {
      console.log(Request);
      done()
    })
  })
})

// describe("User Service Unit Tests", function () {
//   describe("Save User functionality", function () {
//     it("should successfully add a user if the number of users in the DB with the same profiled is zero", async function () {
//       const profileId = 1;
//       const name = "Akshay";
//       const dob = "2020-12-12";
//       const experience = [{ years: 2, organizationName: "ABCD" }];
//       const returnedUser = await saveUser({
//         profileId, 
//         name,
//         dob,
//         experience,
//       });
//       expect(returnedUser.name).to.equal(name);
//       expect(returnedUser.dob.toString()).to.equal((new Date(dob)).toString());
//       experience.map((exp, index) => {
//         expect(returnedUser.experience[index].years).to.equal(exp.years);
//         expect(returnedUser.experience[index].organizationName).to.equal(exp.organizationName);
//       })
//     });
//     it("should throw an error if the number of users with the same profileId is not zero", async function () { });
//   });
// });