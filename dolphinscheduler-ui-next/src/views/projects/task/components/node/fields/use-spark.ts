/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { queryResourceByProgramType } from '@/service/modules/resources'
import { removeUselessChildren } from './use-shell'
import type { IJsonItem } from '../types'

export function useSpark(model: { [field: string]: any }): IJsonItem[] {
  const { t } = useI18n()

  const mainClassSpan = computed(() =>
    model.programType === 'PYTHON' ? 0 : 24
  )

  const mainJarOptions = ref([])
  const resources: { [field: string]: any } = {}

  const getResourceList = async (programType: string) => {
    if (resources[programType] !== void 0) {
      mainJarOptions.value = resources[programType]
      return
    }
    try {
      const res = await queryResourceByProgramType({
        type: 'FILE',
        programType
      })
      removeUselessChildren(res)
      mainJarOptions.value = res || []
      resources[programType] = res
    } catch (err) {}
  }

  onMounted(() => {
    getResourceList(model.programType)
  })

  return [
    {
      type: 'select',
      field: 'programType',
      span: 12,
      name: t('project.node.program_type'),
      options: PROGRAM_TYPES,
      props: {
        'on-update:value': (value: string) => {
          model.mainJar = null
          model.mainClass = ''
          getResourceList(value)
        }
      },
      value: model.programType
    },
    {
      type: 'select',
      field: 'sparkVersion',
      span: 12,
      name: t('project.node.spark_version'),
      options: SPARK_VERSIONS,
      value: model.sparkVersion
    },
    {
      type: 'input',
      field: 'mainClass',
      span: mainClassSpan,
      name: t('project.node.main_class'),
      props: {
        placeholder: t('project.node.main_class_tips')
      },
      validate: {
        trigger: ['input', 'blur'],
        required: model.programType !== 'PYTHON',
        validator(validate: any, value: string) {
          if (model.programType !== 'PYTHON' && !value) {
            return new Error(t('project.node.main_class_tips'))
          }
        }
      }
    },
    {
      type: 'tree-select',
      field: 'mainJar',
      name: t('project.node.main_package'),
      props: {
        cascade: true,
        showPath: true,
        checkStrategy: 'child',
        placeholder: t('project.node.main_package_tips'),
        keyField: 'id',
        labelField: 'fullName'
      },
      validate: {
        trigger: ['input', 'blur'],
        required: model.programType !== 'PYTHON',
        validator(validate: any, value: string) {
          if (!value) {
            return new Error(t('project.node.main_package_tips'))
          }
        }
      },
      options: mainJarOptions
    },
    {
      type: 'radio',
      field: 'deployMode',
      name: t('project.node.deploy_mode'),
      options: DeployModes
    },
    {
      type: 'input',
      field: 'appName',
      name: t('project.node.app_name'),
      props: {
        placeholder: t('project.node.app_name_tips')
      }
    },
    {
      type: 'input-number',
      field: 'driverCores',
      name: t('project.node.driver_cores'),
      span: 12,
      props: {
        placeholder: t('project.node.driver_cores_tips'),
        min: 1
      },
      validate: {
        trigger: ['input', 'blur'],
        required: true,
        validator(validate: any, value: string) {
          if (!value) {
            return new Error(t('project.node.driver_cores_tips'))
          }
        }
      }
    },
    {
      type: 'input',
      field: 'driverMemory',
      name: t('project.node.driver_memory'),
      span: 12,
      props: {
        placeholder: t('project.node.driver_memory_tips')
      },
      validate: {
        trigger: ['input', 'blur'],
        required: true,
        validator(validate: any, value: string) {
          if (!value) {
            return new Error(t('project.node.driver_memory_tips'))
          }
          if (!Number.isInteger(parseInt(value))) {
            return new Error(
              t('project.node.driver_memory') +
                t('project.node.positive_integer_tips')
            )
          }
        }
      },
      value: model.driverMemory
    },
    {
      type: 'input-number',
      field: 'numExecutors',
      name: t('project.node.executor_number'),
      span: 12,
      props: {
        placeholder: t('project.node.executor_number_tips'),
        min: 1
      },
      validate: {
        trigger: ['input', 'blur'],
        required: true,
        validator(validate: any, value: string) {
          if (!value) {
            return new Error(t('project.node.executor_number_tips'))
          }
        }
      },
      value: model.numExecutors
    },
    {
      type: 'input',
      field: 'executorMemory',
      name: t('project.node.executor_memory'),
      span: 12,
      props: {
        placeholder: t('project.node.executor_memory_tips')
      },
      validate: {
        trigger: ['input', 'blur'],
        required: true,
        validator(validate: any, value: string) {
          if (!value) {
            return new Error(t('project.node.executor_memory_tips'))
          }
          if (!Number.isInteger(parseInt(value))) {
            return new Error(
              t('project.node.executor_memory_tips') +
                t('project.node.positive_integer_tips')
            )
          }
        }
      },
      value: model.executorMemory
    },
    {
      type: 'input-number',
      field: 'executorCores',
      name: t('project.node.executor_cores'),
      span: 12,
      props: {
        placeholder: t('project.node.executor_cores_tips'),
        min: 1
      },
      validate: {
        trigger: ['input', 'blur'],
        required: true,
        validator(validate: any, value: string) {
          if (!value) {
            return new Error(t('project.node.executor_cores_tips'))
          }
        }
      },
      value: model.executorCores
    },
    {
      type: 'input',
      field: 'mainArgs',
      name: t('project.node.main_arguments'),
      props: {
        type: 'textarea',
        placeholder: t('project.node.main_arguments_tips')
      }
    },
    {
      type: 'input',
      field: 'others',
      name: t('project.node.option_parameters'),
      props: {
        type: 'textarea',
        placeholder: t('project.node.option_parameters_tips')
      }
    },
    {
      type: 'tree-select',
      field: 'resourceList',
      name: t('project.node.resources'),
      options: mainJarOptions,
      props: {
        multiple: true,
        checkable: true,
        cascade: true,
        showPath: true,
        checkStrategy: 'child',
        placeholder: t('project.node.resources_tips'),
        keyField: 'id',
        labelField: 'name'
      }
    },
    {
      type: 'custom-parameters',
      field: 'localParams',
      name: t('project.node.custom_parameters'),
      children: [
        {
          type: 'input',
          field: 'prop',
          span: 10,
          props: {
            placeholder: t('project.node.prop_tips'),
            maxLength: 256
          },
          validate: {
            trigger: ['input', 'blur'],
            required: true,
            validator(validate: any, value: string) {
              if (!value) {
                return new Error(t('project.node.prop_tips'))
              }

              const sameItems = model.localParams.filter(
                (item: { prop: string }) => item.prop === value
              )

              if (sameItems.length > 1) {
                return new Error(t('project.node.prop_repeat'))
              }
            }
          }
        },
        {
          type: 'input',
          field: 'value',
          span: 10,
          props: {
            placeholder: t('project.node.value_tips'),
            maxLength: 256
          }
        }
      ]
    }
  ]
}

const PROGRAM_TYPES = [
  {
    label: 'JAVA',
    value: 'JAVA'
  },
  {
    label: 'SCALA',
    value: 'SCALA'
  },
  {
    label: 'PYTHON',
    value: 'PYTHON'
  }
]

const SPARK_VERSIONS = [
  {
    label: 'SPARK2',
    value: 'SPARK2'
  },
  {
    label: 'SPARK1',
    value: 'SPARK1'
  }
]

const DeployModes = [
  {
    label: 'cluster',
    value: 'cluster'
  },
  {
    label: 'client',
    value: 'client'
  },
  {
    label: 'local',
    value: 'local'
  }
]