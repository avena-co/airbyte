/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.workers.helper;

import io.airbyte.commons.json.Jsons;
import io.airbyte.config.Pipeline;

import lombok.AllArgsConstructor;

// todo (cgardens) - we are not getting any value out of instantiating this class. we should just
// use it as statics. not doing it now, because already in the middle of another refactor.
@AllArgsConstructor
public class PipelineHelper {
    /**
     * Core logic for merging an existing pipeline configuration with an update.
     *
     * @param original        - already persisted pipeline
     * @param update          - updated pipeline info to be merged with original pipeline.
     * @return new sync object
     */
    public static Pipeline updatePipelineObject(final Pipeline original, final Pipeline update) {
        final Pipeline newPipeline = Jsons.clone(original);

        // update name
        if (update.getName() != null) {
            newPipeline.withName(update.getName());
        }

        return newPipeline;
    }
}
