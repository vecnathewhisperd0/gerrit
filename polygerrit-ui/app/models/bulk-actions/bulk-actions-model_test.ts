/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {createChange} from '../../test/test-data-generators';
import {ChangeInfoId} from '../../api/rest-api';
import {BulkActionsModel} from './bulk-actions-model';
import {getAppContext} from '../../services/app-context';
import '../../test/common-test-setup-karma';
import {waitUntilObserved} from '../../test/test-utils';

suite('bulk actions model test', () => {
  test('add and remove selected changes', () => {
    const c1 = createChange();
    c1.id = '1' as ChangeInfoId;
    const c2 = createChange();
    c2.id = '2' as ChangeInfoId;

    const bulkActionsModel = new BulkActionsModel(
      getAppContext().restApiService
    );

    assert.deepEqual(bulkActionsModel.getState().selectedChangeIds, []);

    bulkActionsModel.addSelectedChangeId(c1.id);
    assert.deepEqual(bulkActionsModel.getState().selectedChangeIds, [c1.id]);

    bulkActionsModel.addSelectedChangeId(c2.id);
    assert.deepEqual(bulkActionsModel.getState().selectedChangeIds, [
      c1.id,
      c2.id,
    ]);

    bulkActionsModel.removeSelectedChangeId(c1.id);
    assert.deepEqual(bulkActionsModel.getState().selectedChangeIds, [c2.id]);

    bulkActionsModel.removeSelectedChangeId(c2.id);
    assert.deepEqual(bulkActionsModel.getState().selectedChangeIds, []);
  });

  test('stale changes are removed from the model', async () => {
    const bulkActionsModel = new BulkActionsModel(
      getAppContext().restApiService
    );

    bulkActionsModel.addSelectedChangeId('0' as ChangeInfoId);
    bulkActionsModel.addSelectedChangeId('1' as ChangeInfoId);

    let selectedChangeIds = await waitUntilObserved(
      bulkActionsModel!.selectedChangeIds$,
      s => s.length === 2
    );

    assert.deepEqual(selectedChangeIds, ['0', '1']);

    bulkActionsModel.sync(['1' as ChangeInfoId]);
    selectedChangeIds = await waitUntilObserved(
      bulkActionsModel!.selectedChangeIds$,
      s => s.length === 1
    );
    assert.deepEqual(selectedChangeIds, ['1']);
  });
});
