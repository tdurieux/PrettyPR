/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';

import { GithubReposCollection } from '../model/githubrepo.js';
import { GithubPrColleciton } from '../model/GithubPrColleciton.js';
import { GithubUserCollection } from '../model/GithubUserCollection.js';
import { PrProcessedCollection } from '../model/PrProcessedCollection.js';

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
        GithubReposCollection.remove({});
        GithubReposCollection.upsert({user:testUser}, {$set:{
          user:testUser,
          repos:testRepo
        }});

      });

      it('can find a repo', () => {
         assert.equal(GithubReposCollection.find().count(), 1);
      });

      it('can delete a repo', () => {
        GithubReposCollection.remove({user:testUser});
        assert.equal(GithubReposCollection.find().count(), 0);
      });

      it('can add a repo', () => {
        GithubReposCollection.upsert({user:testUser2}, {$set:{
          user:testUser2,
          repos:testRepo2
        }});
        assert.equal(GithubReposCollection.find().count(), 2);
      });

      it('can update a repo', () => {
        GithubReposCollection.upsert({user:testUser}, {$set:{
          user:testUser,
          repos:testRepo2
        }});
        assert.equal(GithubReposCollection.find().count(), 1);
      });


    });

    describe('Github PullRequest', () => {

      beforeEach(() => {
        GithubPrColleciton.remove({});
        GithubPrColleciton.upsert({user:testUser, repo: testRepo}, {$set:{
          user:testUser,
          repo:testRepo,
          pullRequests:testPr
        }});
      });

      it('can find a PullRequest', () => {
         assert.equal(GithubPrColleciton.find({user:testUser, repo:testRepo}).count(), 1);
      });

      it('can delete a PullRequest', () => {
        GithubPrColleciton.remove({user:testUser, repo:testRepo});
        assert.equal(GithubPrColleciton.find().count(), 0);
      });

      it('can add a PullRequest', () => {
        GithubPrColleciton.upsert({user:testUser2}, {$set:{
          user:testUser2,
          repo:testRepo2,
          pullRequests:testPr2
        }});
        assert.equal(GithubPrColleciton.find().count(), 2);
      });

      it('can update a PullRequest', () => {
        GithubPrColleciton.upsert({user:testUser, repo:testRepo}, {$set:{
          user:testUser,
          repo:testRepo,
          pullRequests:testPr2
        }});
        assert.equal(GithubPrColleciton.find().count(), 1);
      });


    });


    describe('Github User', () => {

      beforeEach(() => {
        GithubUserCollection.remove({});
        GithubUserCollection.upsert({user:testUser}, {$set:{
          user:testUser,
          token:testToken
        }});
      });

      it('can find a user', () => {
         assert.equal(GithubUserCollection.find({user:testUser}).count(), 1);
      });

      it('can delete a user', () => {
        GithubUserCollection.remove({user:testUser});
        assert.equal(GithubUserCollection.find().count(), 0);
      });

      it('can add a user', () => {
        GithubUserCollection.upsert({user:testUser2}, {$set:{
          user:testUser2,
          token:testToken2
        }});
        assert.equal(GithubUserCollection.find().count(), 2);
      });

      it('can update a user', () => {
        GithubUserCollection.upsert({user:testUser}, {$set:{
          user:testUser,
          token:testToken2
        }});
        assert.equal(GithubUserCollection.find().count(), 1);
      });


    });

    describe('PrProcessedCollection', () => {

      beforeEach(() => {
        PrProcessedCollection.remove({});
        PrProcessedCollection.upsert({user:testUser, url:testUrl}, {$set:{
          user:testUser,
          url:testUrl,
          result:testResult
        }});

      });

      it('can find a PrProcessedCollection', () => {
         assert.equal(PrProcessedCollection.find({user:testUser, url:testUrl}).count(), 1);
      });

      it('can delete a PrProcessedCollection', () => {
        PrProcessedCollection.remove({user:testUser, url:testUrl});
        assert.equal(PrProcessedCollection.find().count(), 0);
      });

      it('can add a PrProcessedCollection', () => {
        PrProcessedCollection.upsert({user:testUser2, url:testUrl2}, {$set:{
          user:testUser2,
          url:testUrl2,
          result:testResult2
        }});
        assert.equal(PrProcessedCollection.find().count(), 2);
      });

      it('can update a PrProcessedCollection', () => {
        PrProcessedCollection.upsert({user:testUser, url:testUrl}, {$set:{
          user:testUser,
          url:testUrl,
          result:testResult2
        }});
        assert.equal(PrProcessedCollection.find().count(), 1);
      });


    });

  });
}
