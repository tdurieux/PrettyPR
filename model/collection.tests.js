/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';

import { GithubRepos } from '../model/githubrepo.js';
import { GithubPr } from '../model/githubpr.js';
import { GithubUser } from '../model/githubuser.js';
import { PrProcessed } from '../model/prprocessed.js';
import { FileUploaded } from '../model/file.js';


var testUser = "test-user";
var testToken = "test-token";
var testRepo = "test-repo";
var testPr = "test-pr";
var testUrl = "test-url";
var testResult = "test-result";
var testUser2 = "test-user2";
var testToken2 = "test-token2";
var testRepo2 = "test-repo2";
var testPr2 = "test-pr2";
var testUrl2 = "test-url2";
var testResult2 = "test-result2";


if (Meteor.isServer) {
  describe('Collections', () => {
    describe('Github Repo', () => {

      beforeEach(() => {
        GithubRepos.remove({});
        GithubRepos.upsert({user:testUser}, {$set:{
          user:testUser,
          repos:testRepo
        }});

      });

      it('can find a repo', () => {
         assert.equal(GithubRepos.find().count(), 1);
      });

      it('can delete a repo', () => {
        GithubRepos.remove({user:testUser});
        assert.equal(GithubRepos.find().count(), 0);
      });

      it('can add a repo', () => {
        GithubRepos.upsert({user:testUser2}, {$set:{
          user:testUser2,
          repos:testRepo2
        }});
        assert.equal(GithubRepos.find().count(), 2);
      });

      it('can update a repo', () => {
        GithubRepos.upsert({user:testUser}, {$set:{
          user:testUser,
          repos:testRepo2
        }});
        assert.equal(GithubRepos.find().count(), 1);
      });


    });

    describe('Github PullRequest', () => {

      beforeEach(() => {
        GithubPr.remove({});
        GithubPr.upsert({user:testUser, repo: testRepo}, {$set:{
          user:testUser,
          repo:testRepo,
          pullRequests:testPr
        }});
      });

      it('can find a PullRequest', () => {
         assert.equal(GithubPr.find({user:testUser, repo:testRepo}).count(), 1);
      });

      it('can delete a PullRequest', () => {
        GithubPr.remove({user:testUser, repo:testRepo});
        assert.equal(GithubPr.find().count(), 0);
      });

      it('can add a PullRequest', () => {
        GithubPr.upsert({user:testUser2}, {$set:{
          user:testUser2,
          repo:testRepo2,
          pullRequests:testPr2
        }});
        assert.equal(GithubPr.find().count(), 2);
      });

      it('can update a PullRequest', () => {
        GithubPr.upsert({user:testUser, repo:testRepo}, {$set:{
          user:testUser,
          repo:testRepo,
          pullRequests:testPr2
        }});
        assert.equal(GithubPr.find().count(), 1);
      });


    });


    describe('Github User', () => {

      beforeEach(() => {
        GithubUser.remove({});
        GithubUser.upsert({user:testUser}, {$set:{
          user:testUser,
          token:testToken
        }});
      });

      it('can find a user', () => {
         assert.equal(GithubUser.find({user:testUser}).count(), 1);
      });

      it('can delete a user', () => {
        GithubUser.remove({user:testUser});
        assert.equal(GithubUser.find().count(), 0);
      });

      it('can add a user', () => {
        GithubUser.upsert({user:testUser2}, {$set:{
          user:testUser2,
          token:testToken2
        }});
        assert.equal(GithubUser.find().count(), 2);
      });

      it('can update a user', () => {
        GithubUser.upsert({user:testUser}, {$set:{
          user:testUser,
          token:testToken2
        }});
        assert.equal(GithubUser.find().count(), 1);
      });


    });

    describe('PrProcessed', () => {

      beforeEach(() => {
        PrProcessed.remove({});
        PrProcessed.upsert({user:testUser, url:testUrl}, {$set:{
          user:testUser,
          url:testUrl,
          result:testResult
        }});

      });

      it('can find a PrProcessed', () => {
         assert.equal(PrProcessed.find({user:testUser, url:testUrl}).count(), 1);
      });

      it('can delete a PrProcessed', () => {
        PrProcessed.remove({user:testUser, url:testUrl});
        assert.equal(PrProcessed.find().count(), 0);
      });

      it('can add a PrProcessed', () => {
        PrProcessed.upsert({user:testUser2, url:testUrl2}, {$set:{
          user:testUser2,
          url:testUrl2,
          result:testResult2
        }});
        assert.equal(PrProcessed.find().count(), 2);
      });

      it('can update a PrProcessed', () => {
        PrProcessed.upsert({user:testUser, url:testUrl}, {$set:{
          user:testUser,
          url:testUrl,
          result:testResult2
        }});
        assert.equal(PrProcessed.find().count(), 1);
      });


    });

  });
}
