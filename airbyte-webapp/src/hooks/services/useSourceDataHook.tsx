/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { useEffect, useState, useCallback } from "react";
import { useFetcher } from "rest-hooks";

// import { SyncSchema } from "core/domain/catalog";
import SourceDataResource from "core/resources/SourceData";
import { JobInfo } from "core/domain/job";

export const useSourceData = (
  sourceId?: string
): {
  isLoading: boolean;
  data: any[];
  dataErrorStatus: { status: number; response: JobInfo } | null;
  onSourceData: () => Promise<void>;
} => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataErrorStatus, setDataErrorStatus] = useState<{
    status: number;
    response: JobInfo;
  } | null>(null);

  const fetchSourceData = useFetcher(SourceDataResource.schemaShape(), true);

  const onSourceData = useCallback(async () => {
    console.log("onSourceData");

    setIsLoading(true);
    setDataErrorStatus(null);
    try {
      const data = await fetchSourceData({ sourceId: sourceId || "" });
      setData(data.data);
    } catch (e) {
      console.log("onSourceData error", e);
      setDataErrorStatus(e);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSourceData, sourceId]);

  useEffect(() => {
    (async () => {
      if (sourceId) {
        await onSourceData();
      }
    })();
  }, [onSourceData, sourceId]);

  return { dataErrorStatus, isLoading, data, onSourceData };
};
