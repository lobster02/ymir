import { FC, useEffect, useState } from 'react'
import { Form, Table, Card, Row, Col } from 'antd'
import { useParams } from 'umi'

import t from '@/utils/t'
import useRequest from '@/hooks/useRequest'

import { getAnnotationCharts, getAssetCharts, getTableColumns, ChartConfigType, ColumnType } from './analysis/AnalysisHelper'
import ChartsContainer, { ChartType } from './analysis/ChartsContainer'
import DataLoading from '@/components/common/DataLoading'
import Suggestion from '@/components/dataset/Suggestion'

import style from './analysis/analysis.less'
import SampleRates from './SampleRates'
import Panel from '../form/panel'
import { DatasetAnalysis } from '@/constants'

const getVersionName = ({ name }: DatasetAnalysis) => `${name}`

const Analysis: FC<{ ids: number[]; classes?: string[] }> = ({ ids, classes = [] }) => {
  const { id } = useParams<{ id: string }>()
  const pid = Number(id)
  const { data: remoteSource, run: fetchSource } = useRequest<DatasetAnalysis[], [{ pid: number; datasets: number[] }]>('dataset/analysis')
  const [source, setSource] = useState<DatasetAnalysis[]>([])
  const [assetCharts, setAssetCharts] = useState<ChartType[]>([])
  const [annotationCharts, setAnnotationCharts] = useState<ChartType[]>([])
  const [tableColumns, setTableColumns] = useState<ColumnType[]>([])
  const [assetChartConfig, setAssetChartConfig] = useState<ChartConfigType[]>([])
  const [annotationChartConfig, setAnnotationChartConfig] = useState<ChartConfigType[]>([])

  useEffect(() => {
    if (source.length) {
      const type = source[0].type
      setTableColumns(getTableColumns(type))
      setAssetChartConfig(getAssetCharts())
      setAnnotationChartConfig(getAnnotationCharts(type))
    }
  }, [source])

  useEffect(() => {
    ids?.length && fetchSource({ pid, datasets: ids })
  }, [ids])

  useEffect(() => {
    const charts = generateCharts(assetChartConfig, source)
    setAssetCharts(charts)
  }, [assetChartConfig, source])

  useEffect(() => {
    const charts = generateCharts(annotationChartConfig, source)
    setAnnotationCharts(charts)
  }, [annotationChartConfig, source])

  useEffect(() => {
    setSource(remoteSource || [])
  }, [remoteSource])

  function generateCharts(configs: ChartConfigType[] = [], datasets: DatasetAnalysis[] = []): ChartType[] {
    return datasets.length
      ? configs.map((config) => {
          const xData = getXData(config, datasets)
          const yData = getYData(config, datasets)
          return {
            label: config.label,
            customOptions: {
              ...config.customOptions,
              xData,
              color: config.color,
              xLabel: config.xUnit,
              yData,
            },
          }
        })
      : []
  }

  function getXData({ getData }: ChartConfigType, datasets: DatasetAnalysis[] = []) {
    const xs = datasets
      .map((dataset) => {
        const { data } = getData(dataset)
        return data.map((item) => item.x)
      })
      .flat()
    return [...new Set(xs)]
  }

  function getYData({ getData }: ChartConfigType, datasets: DatasetAnalysis[]) {
    const yData =
      datasets &&
      datasets.map((dataset) => {
        const { data, total } = getData(dataset)
        const name = getVersionName(dataset)
        return {
          name,
          value: data.map((item) => (total ? item.y / total : 0)),
          count: data.map((item) => item.y),
        }
      })
    return yData
  }

  return (
    <Card className={style.container} title={t('breadcrumbs.dataset.analysis')}>
      {source.length ? (
        <Row gutter={20} className={style.dataContainer}>
          <Col span={16} className={`${style.rowData} ${style.maxHeight}`}>
            <Table
              size="small"
              dataSource={source}
              rowKey={(record) => getVersionName(record)}
              rowClassName={style.rowClass}
              className={style.tableClass}
              columns={tableColumns}
              pagination={false}
            />
            <ChartsContainer label="dataset.analysis.annotations.metrics" charts={annotationCharts} />
            <ChartsContainer label="dataset.analysis.assets.metrics" charts={assetCharts} />
          </Col>
          <Col span={8} className={`${style.maxHeight} rightForm`}>
            {source.map((item) => (
              <Panel key={item.id} toogleVisible={false} label={item.name}>
                <SampleRates keywords={classes} dataset={item} />
                <Suggestion suggestions={item.suggestions} target={classes} />
              </Panel>
            ))}
          </Col>
        </Row>
      ) : (
        <DataLoading />
      )}
    </Card>
  )
}

export default Analysis
