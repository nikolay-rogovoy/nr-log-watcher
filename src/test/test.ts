// Reference mocha-typescript's global definitions:
/// <reference path="../../node_modules/mocha-typescript/globals.d.ts" />

import {assert} from 'chai';
import {suite, test, timeout} from "mocha-typescript";

@suite(timeout(2000))
class UnitTest {
    @test 'log-watcher'() {
        assert(true);
    }
}
