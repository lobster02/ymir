import { Popover, TableColumnType } from 'antd'
import { ReactNode } from 'react'

import t from '@/utils/t'
import { humanize, toFixed } from '@/utils/number'
import { ObjectType } from '@/constants/project'
import VersionName from '@/components/result/VersionName'
import { EChartsOption } from 'echarts'
import { AnalysisChart, DatasetAnalysis } from '@/constants'

type Keys =
  | 'assetHWRatio'
  | 'assetArea'
  | 'assetQuality'
  | 'areaRatio'
  | 'keywordAnnotationCount'
  | 'keywordCounts'
  | 'keywordArea'
  | 'instanceArea'
  | 'crowdedness'
  | 'complexity'
type Data = DatasetAnalysis
export type YDataType = {
  name: string
  count: number[]
  value: number[]
}
export type Chart = EChartsOption & {
  xData: (number | string)[]
  yData: YDataType[]
  xLabel?: string
  barWidth?: number
  tooltipLabel?: string
  yAxisFormatter?: (value: number, index: number) => string
}
export type ChartConfigWithoutData = {
  label: string
  renderX?: (x: number) => string
  xUnit?: string
  xRange?: boolean
  xMax?: boolean
  color?: string[]
  customOptions?: {
    [key: string]: any
  }
}
export type ChartConfigType = ChartConfigWithoutData & {
  getData: (dataset: Data) => AnalysisChart
}
export type ColumnType = TableColumnType<Data>

const charts: { [key: string]: ChartConfigWithoutData } = {
  assetHWRatio: {
    label: 'dataset.analysis.title.asset_hw_ratio',
    xRange: true,
    color: ['#36CBCB', '#E8B900'],
  },
  assetArea: {
    label: 'dataset.analysis.title.asset_area',
    xUnit: 'px*px',
    xRange: true,
    renderX: (x: number) => `${x / 10000}W`,
    color: ['#36CBCB', '#F2637B'],
  },
  assetQuality: {
    label: 'dataset.analysis.title.asset_quality',
    color: ['#36CBCB', '#10BC5E'],
    xMax: true,
    xRange: true,
  },
  areaRatio: {
    label: 'dataset.analysis.title.anno_area_ratio',
    customOptions: {
      tooltipLabel: 'dataset.analysis.bar.anno.tooltip',
    },
    color: ['#10BC5E', '#E8B900'],
    xMax: true,
    xRange: true,
  },
  keywordAnnotationCount: {
    label: 'dataset.analysis.title.keyword_ratio',
    customOptions: {
      tooltipLabel: 'dataset.analysis.bar.anno.tooltip',
    },
    color: ['#2CBDE9', '#E8B900'],
  },
  keywordCounts: {
    label: 'dataset.analysis.title.keyword_ratio',
    customOptions: {
      tooltipLabel: 'dataset.analysis.bar.anno.tooltip',
    },
    color: ['#2CBDE9', '#E8B900'],
  },
  keywordArea: {
    label: 'dataset.analysis.title.keyword_area',
    customOptions: {
      tooltipLabel: 'dataset.analysis.bar.area.tooltip',
    },
    xUnit: 'px*px',
    color: ['#2CBDE9', '#E8B900'],
  },
  instanceArea: {
    label: 'dataset.analysis.title.instance_area',
    customOptions: {
      tooltipLabel: 'dataset.analysis.bar.anno.tooltip',
    },
    xUnit: 'px*px',
    xMax: true,
    xRange: true,
    color: ['#10BC5E', '#F2637B'],
  },
  crowdedness: {
    label: 'dataset.analysis.title.crowdedness',
    xUnit: t('dataset.analysis.unit.crowdedness'),
    xMax: true,
    color: ['#10BC5E', '#F2637B'],
  },
  complexity: {
    label: 'dataset.analysis.title.complexity',
    xUnit: t('dataset.analysis.unit.complexity'),
    xMax: true,
    xRange: true,
    color: ['#10BC5E', '#F2637B'],
  },
}

const getColumns = (keys: string[]): ColumnType[] => {
  const columns: { [key: string]: ColumnType } = {
    name: {
      title: title('dataset.analysis.column.name'),
      render: (_, record) => <VersionName result={record} />,
    },
    labeled: {
      title: title('dataset.analysis.column.labelled'),
      render: (_, record) => {
        const anno = record
        const labeled = record.assetCount - anno.negative
        return renderPop(labeled)
      },
      width: 80,
    },
    assetCount: {
      title: title('dataset.analysis.column.assets.count'),
      render: (assetCount) => renderPop(assetCount),
    },
    keywordsCount: {
      title: title('dataset.analysis.column.keywords.count'),
      render: (_, record) => Object.keys(record.keywords).length,
    },
    averageKeywordsCount: {
      title: title('dataset.analysis.column.keywords.count.average'),
      render: (_, record) => {
        const keywords = record.gt?.count || {}
        const sum = Object.values(keywords).reduce((prev, current) => prev + current, 0)
        return toFixed(sum / record.assetCount, 2)
      },
    },
    annotationsCount: {
      title: title('dataset.analysis.column.annotations.total'),
      render: (_, record) => {
        const count = record.total
        return renderPop(count)
      },
    },
    averageAnnotationsCount: {
      title: title('dataset.analysis.column.annotations.average'),
      render: (_, record) => toFixed(record.average, 2),
    },
    annotationsAreaTotal: {
      title: title('dataset.analysis.column.annotations.area.total'),
      render: (_, record) => unit(record.totalArea),
    },
    averageAnnotationsArea: {
      title: title('dataset.analysis.column.annotations.area.average'),
      render: (_, record) => {
        const total = record.totalArea
        return unit(toFixed(total / record.assetCount, 2))
      },
    },
    instanceCount: {
      title: title('dataset.analysis.column.instances.total'),
      render: (_, record) => renderPop(record.total),
    },
    averageInstanceCount: {
      title: title('dataset.analysis.column.instances.average'),
      render: (_, record) => {
        const total = record.total
        return toFixed(total / record.assetCount, 2)
      },
    },
    cksCount: {
      title: title('dataset.analysis.column.cks.count'),
      render: (text, record) => record.cks?.subKeywordsTotal || 0,
    },
  }
  return keys.map((key) => ({ ...columns[key], dataIndex: key, ellipsis: true, align: 'center' }))
}

function renderPop(num: number) {
  const label = humanize(num)
  return (
    <Popover content={num}>
      <span>{label}</span>
    </Popover>
  )
}

function unit(value?: string | number, u = 'px', def: string | number = 0) {
  return value ? value + u : def + u
}

function title(str = '') {
  return <strong>{t(str)}</strong>
}

const getTableColumns = (objectType: ObjectType) => {
  const keys = (cols: string[]) => ['name', 'labeled', 'assetCount', 'keywordsCount', 'averageKeywordsCount', ...cols]
  const maps: { [key: number]: string[] } = {
    [ObjectType.ObjectDetection]: keys(['annotationsCount', 'averageAnnotationsCount', 'cksCount']),
    [ObjectType.SemanticSegmentation]: keys(['annotationsAreaTotal', 'averageAnnotationsArea']),
    [ObjectType.InstanceSegmentation]: keys(['instanceCount', 'averageInstanceCount']),
    [ObjectType.MultiModal]: keys(['annotationsCount', 'averageAnnotationsCount', 'cksCount']),
  }
  return getColumns(maps[objectType])
}

const getCharts = (keys: Keys[]) =>
  keys.map((key) => {
    const chart = charts[key]
    return {
      ...charts[key],
      getData: (dataset: Data) => {
        const { data, total } = dataset[key]
        const { renderX = (x) => `${x}`, xMax, xRange } = chart
        const list = data.map(({ x, y }, index) => {
          const next = data[index + 1]
          const renderRangeX = (x: string, xRange?: boolean) => {
            return xRange ? (xMax && !next ? x : `[${x},${next ? renderX(next.x as number) : '+'})`) : x
          }
          return {
            x: renderRangeX(renderX(x as number), xRange),
            y,
          }
        })
        return {
          data: list,
          total,
        }
      },
    }
  })

const getAnnotationCharts = (objectType: ObjectType) => {
  const maps: { [key: number]: Keys[] } = {
    [ObjectType.ObjectDetection]: ['complexity', 'keywordAnnotationCount', 'areaRatio'],
    [ObjectType.SemanticSegmentation]: ['complexity', 'keywordCounts', 'keywordArea'],
    [ObjectType.InstanceSegmentation]: ['complexity', 'keywordAnnotationCount', 'crowdedness', 'instanceArea', 'keywordArea'],
    [ObjectType.MultiModal]: ['complexity', 'keywordAnnotationCount', 'areaRatio'],
  }
  const keys = maps[objectType]
  return getCharts(keys)
}

const getAssetCharts = () => {
  return getCharts(['assetHWRatio', 'assetArea'])
}

export { getAnnotationCharts, getAssetCharts, getTableColumns }
