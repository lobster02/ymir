import { DatasetGroup, Dataset } from "@/interface/dataset"
import { ModelVersion as Model } from "@/interface/model"
type DatasetId = number
export interface Project {
  id: number,
  name: string,
  type: number,
  keywords: Array<string>,
  candidateTrainSet: number,
  trainSet?: DatasetGroup,
  testSet?: Dataset,
  miningSet?: Dataset,
  testingSets?: Array<number>,
  setCount: number,
  trainSetVersion?: number,
  model?: number,
  modelStage?: Array<number>,
  modelCount: number,
  miningStrategy: number,
  chunkSize?: number,
  currentIteration?: Iteration,
  round: number,
  currentStage: number,
  createTime: string,
  updateTime: string,
  description?: string,
  isExample?: boolean,
  hiddenDatasets: Array<number>,
  hiddenModels: Array<number>,
  enableIteration: boolean,
  totalAssetCount: number,
  runningTaskCount: number,
  totalTaskCount: number,
}

export interface Iteration {
  id: number,
  projectId: number,
  name?: string,
  round: number,
  currentStage: number,
  testSet?: DatasetId,
  trainSet?: DatasetId,
  trainUpdateSet: DatasetId,
  trainUpdateDataset?: Dataset,
  miningSet?: DatasetId,
  miningDataset?: Dataset,
  miningResult?: DatasetId,
  miningResultDataset?: Dataset,
  labelSet?: DatasetId,
  labelDataset?: Dataset,
  model?: number,
  trainingModel?: Model,
  prevIteration: number,
}
