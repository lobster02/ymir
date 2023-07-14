import { calDuration, format } from '@/utils/date'
import { getVersionLabel, ResultStates as states } from './common'
import { getLocale } from 'umi'
import { getProjectTypeLabel, ObjectType } from './project'
import { Model, ModelGroup, Stage, StageMetrics } from './typings/model.d'
import { Backend } from './typings/common.d'

export function transferModelGroup(data: Backend) {
  const group: ModelGroup = {
    id: data.id,
    name: data.name,
    projectId: data.project_id,
    createTime: format(data.create_datetime),
    versions: data.models ? data.models.reverse().map(transferModel) : [],
  }
  return group
}

export function transferModel(data: Backend): Model {
  const durationLabel = calDuration(data.related_task.duration, getLocale())
  const type = data.object_type || ObjectType.ObjectDetection
  const versionName = getVersionLabel(data.version_num)

  const model: Model = {
    id: data.id,
    name: `${data.group_name} ${versionName}`,
    groupId: data.model_group_id,
    projectId: data.project_id,
    type,
    hash: data.hash,
    version: data.version_num || 0,
    versionName,
    state: data.result_state,
    keywords: data?.keywords || [],
    map: data.map || 0,
    url: data.url || '',
    createTime: format(data.create_datetime),
    updateTime: format(data.update_datetime),
    taskId: data.related_task.id,
    progress: data.related_task.percent || 0,
    taskType: data.related_task.type,
    taskState: data.related_task.state,
    taskName: data.related_task.name,
    duration: data.related_task.duration,
    durationLabel: calDuration(data.related_task.duration, getLocale()),
    task: { ...data.related_task, durationLabel },
    hidden: !data.is_visible,
    stages: [],
    recommendStage: data.recommended_stage || 0,
    description: data.description || '',
  }

  const stages = (data.related_stages || []).map((stage: Backend) => {
    const st = transferStage(stage, model)
    return { ...st, primaryMetricLabel: getPrimaryMetricsLabel(type, true) }
  })

  stages && (model.stages = stages)

  return model
}

/**
 * is valid model
 * @param {Model} model
 * @returns {Boolean}
 */
export function validModel(model: Model): Boolean {
  return model.state === states.VALID
}

/**
 * is invalid model
 * @param {Model} model
 * @returns {Boolean}
 */
export function invalidModel(model: Model): Boolean {
  return model.state === states.INVALID
}

/**
 * is running model
 * @param {Model} model
 * @returns {Boolean}
 */
export function runningModel(model: Model): Boolean {
  return model.state === states.READY
}

export function getModelName(data: Backend) {
  return `${data.model?.group_name} ${getVersionLabel(data.model?.version_num)}`
}

/**
 * transfer backend data into stage object
 * @param {Backend} data
 * @returns {Stage}
 */
export function transferStage(data: Backend, model: Model): Stage {
  const metrics = transferMetrics(data.metrics, model.type)
  return {
    id: data.id,
    name: data.name,
    primaryMetric: metrics.primary,
    modelId: model.id,
    modelName: model.name,
    metrics,
  }
}

function transferMetrics(metrics: { [key: string]: number } = {}, type: number): StageMetrics {
  const { acc, ap, ar, boxAP, fn, fp, iou, maskAP, tp } = metrics

  const mk: { [key: number]: any } = {
    [ObjectType.ObjectDetection]: { primary: ap, ap, ar },
    [ObjectType.SemanticSegmentation]: { primary: iou, iou, acc },
    [ObjectType.InstanceSegmentation]: { primary: maskAP, maskAP, boxAP },
    [ObjectType.MultiModal]: { primary: ap, ap, ar },
  }
  const target = mk[type] || {}
  return { ...target, fn, fp, tp }
}

export function getPrimaryMetricsLabel(type: ObjectType, isSimple?: boolean) {
  if (isSimple) {
    const maps: { [key: number]: string } = {
      [ObjectType.ObjectDetection]: 'mAP',
      [ObjectType.SemanticSegmentation]: 'mIoU',
      [ObjectType.InstanceSegmentation]: 'maskAP',
    }
    return maps[type] || 'mAP'
  } else {
    const label = getProjectTypeLabel(type)
    return `model.stage.metrics.primary.label.${label}`
  }
}

/**
 * get recommend stage from model
 * @param {Model} model
 * @returns {Stage|undefined}
 */
export function getRecommendStage(model: Model): Stage | undefined {
  return model ? getStage(model, model.recommendStage) : undefined
}

/**
 * @description get Model stage
 * @export
 * @param {Model} model
 * @param {number} stageId
 * @return {Stage | undefined}
 */
export function getStage(model: Model, stageId: number): Stage | undefined {
  return model.stages?.find((stage) => stage.id === stageId)
}
