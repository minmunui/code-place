import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/api'
import { handleApiError } from '../../utils/errorHandler'

const CreateProblem = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    input_description: '',
    output_description: '',
    time_limit: 1000,
    memory_limit: 256,
    difficulty: 'Low',
    visible: true,
    share_submission: false,
    field: '',
    tags: [],
    languages: [],
    samples: [{ input: '', output: '' }],
    hint: '',
    template: {},
    spj: false,
    spj_language: 'C',
    spj_code: '',
    spj_compile_ok: false,
    test_case_id: '',
    test_case_score: [],
    rule_type: 'ACM',
    io_mode: {
      io_mode: 'Standard IO',
      input: 'input.txt',
      output: 'output.txt'
    },
    source: ''
  })

  const [availableLanguages, setAvailableLanguages] = useState([])
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [compiling, setCompiling] = useState(false)
  const [loading, setLoading] = useState(false)

  // Field options (from Vue implementation)
  const fieldOptions = [
    { value: 0, label: t('Implementation') || 'Implementation' },
    { value: 1, label: t('Math') || 'Math' },
    { value: 2, label: t('Data_Structure') || 'Data Structure' },
    { value: 3, label: t('Search') || 'Search' },
    { value: 4, label: t('Sorting') || 'Sorting' },
    { value: 5, label: t('Algorithm') || 'Algorithm' }
  ]

  const difficultyOptions = ['VeryLow', 'Low', 'Mid', 'High', 'VeryHigh']

  // Fetch available languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await api.get('/languages')
        setAvailableLanguages(response.data.data.languages)
      } catch (error) {
        console.error('Failed to fetch languages:', error)
      }
    }
    fetchLanguages()
  }, [])

  // Fetch tag suggestions
  const fetchTagSuggestions = async (keyword) => {
    if (!keyword) {
      setTagSuggestions([])
      return
    }
    try {
      const response = await api.get('/problem/tags', { params: { keyword } })
      setTagSuggestions(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  // Handle test case file upload
  const handleTestCaseUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('spj', formData.spj)

    setUploading(true)
    try {
      const response = await api.post('/admin/test_case', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { id, info } = response.data.data
      const totalFiles = info.length
      const scorePerCase = Math.floor(100 / totalFiles)

      const testCaseScore = info.map((item) => ({
        input_name: item.input_name,
        output_name: formData.spj ? '-' : item.output_name,
        score: scorePerCase
      }))

      setFormData({
        ...formData,
        test_case_id: id,
        test_case_score: testCaseScore
      })

      alert(t('Upload_Succeeded') || 'Upload succeeded')
    } catch (error) {
      const message = handleApiError('Upload Test Case', error, t('Upload_Failed'))
      alert(message)
    } finally {
      setUploading(false)
    }
  }

  // Handle SPJ compilation
  const handleCompileSPJ = async () => {
    if (!formData.spj_code) {
      alert(t('SPJ_Code_Required') || 'SPJ code is required')
      return
    }

    setCompiling(true)
    try {
      const response = await api.post('/admin/compile_spj', {
        spj_language: formData.spj_language,
        spj_code: formData.spj_code
      })

      if (response.data.data.err) {
        alert(t('Compile_Failed') || 'Compile failed: ' + response.data.data.data)
        setFormData({ ...formData, spj_compile_ok: false })
      } else {
        alert(t('Compile_Succeeded') || 'Compile succeeded')
        setFormData({ ...formData, spj_compile_ok: true })
      }
    } catch (error) {
      const message = handleApiError('Compile SPJ', error, t('Compile_Failed'))
      alert(message)
      setFormData({ ...formData, spj_compile_ok: false })
    } finally {
      setCompiling(false)
    }
  }

  // Add sample
  const addSample = () => {
    setFormData({
      ...formData,
      samples: [...formData.samples, { input: '', output: '' }]
    })
  }

  // Remove sample
  const removeSample = (index) => {
    if (formData.samples.length <= 1) {
      alert(t('At_Least_One_Sample') || 'At least one sample is required')
      return
    }
    const newSamples = formData.samples.filter((_, i) => i !== index)
    setFormData({ ...formData, samples: newSamples })
  }

  // Update sample
  const updateSample = (index, field, value) => {
    const newSamples = [...formData.samples]
    newSamples[index][field] = value
    setFormData({ ...formData, samples: newSamples })
  }

  // Add tag
  const addTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    }
    setTagInput('')
    setTagSuggestions([])
  }

  // Remove tag
  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  // Toggle language
  const toggleLanguage = (lang) => {
    if (formData.languages.includes(lang)) {
      setFormData({ ...formData, languages: formData.languages.filter((l) => l !== lang) })
    } else {
      setFormData({ ...formData, languages: [...formData.languages, lang] })
    }
  }

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      alert(t('Title_Required') || 'Title is required')
      return false
    }
    if (!formData.description.trim()) {
      alert(t('Description_Required') || 'Description is required')
      return false
    }
    if (!formData.input_description.trim()) {
      alert(t('Input_Description_Required') || 'Input description is required')
      return false
    }
    if (!formData.output_description.trim()) {
      alert(t('Output_Description_Required') || 'Output description is required')
      return false
    }
    if (formData.field === '') {
      alert(t('Field_Required') || 'Field is required')
      return false
    }
    if (formData.tags.length === 0) {
      alert(t('Tags_Required') || 'At least one tag is required')
      return false
    }
    if (formData.languages.length === 0) {
      alert(t('Languages_Required') || 'At least one language is required')
      return false
    }
    if (formData.samples.length === 0) {
      alert(t('Samples_Required') || 'At least one sample is required')
      return false
    }
    for (const sample of formData.samples) {
      if (!sample.input.trim() || !sample.output.trim()) {
        alert(t('Sample_Input_Output_Required') || 'All samples must have both input and output')
        return false
      }
    }
    if (!formData.test_case_id) {
      alert(t('Test_Case_Required') || 'Test case file is required')
      return false
    }
    if (formData.spj && !formData.spj_compile_ok) {
      alert(t('SPJ_Not_Compiled') || 'SPJ code must be compiled successfully')
      return false
    }
    return true
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await api.post('/admin/problem', formData)
      alert(t('Create_Succeeded') || 'Problem created successfully')
      navigate('/admin/problems')
    } catch (error) {
      const message = handleApiError('Create Problem', error, t('Create_Failed'))
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('Create_Problem')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('Basic_Information')}
          </h2>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Title')} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Display ID */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Display_ID')}
            </label>
            <input
              type="text"
              value={formData._id}
              onChange={(e) => setFormData({ ...formData, _id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('Optional')}
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Description')} *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{t('HTML_Supported')}</p>
          </div>

          {/* Input Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Input_Description')} *
            </label>
            <textarea
              value={formData.input_description}
              onChange={(e) => setFormData({ ...formData, input_description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{t('HTML_Supported')}</p>
          </div>

          {/* Output Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Output_Description')} *
            </label>
            <textarea
              value={formData.output_description}
              onChange={(e) => setFormData({ ...formData, output_description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{t('HTML_Supported')}</p>
          </div>

          {/* Time and Memory Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('Time_Limit')} (ms) *
              </label>
              <input
                type="number"
                value={formData.time_limit}
                onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('Memory_Limit')} (MB) *
              </label>
              <input
                type="number"
                value={formData.memory_limit}
                onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Difficulty and Field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('Difficulty')}
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {difficultyOptions.map((diff) => (
                  <option key={diff} value={diff}>
                    {t(diff)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('Field')} *
              </label>
              <select
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">{t('Select_Field')}</option>
                {fieldOptions.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Source */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Source')}
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('Optional')}
            />
          </div>

          {/* Hint */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Hint')}
            </label>
            <textarea
              value={formData.hint}
              onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('Optional')}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('Tags')} *
          </h2>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value)
                  fetchTagSuggestions(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (tagInput.trim()) {
                      addTag(tagInput.trim())
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('Type_Tag_Press_Enter')}
              />
              {tagSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {tagSuggestions.map((tag, index) => (
                    <div
                      key={index}
                      onClick={() => addTag(tag.name)}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('Supported_Languages')} *
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableLanguages.map((lang) => (
              <label key={lang.name} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang.name)}
                  onChange={() => toggleLanguage(lang.name)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{lang.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Samples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('Samples')} *
            </h2>
            <button
              type="button"
              onClick={addSample}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {t('Add_Sample')}
            </button>
          </div>

          {formData.samples.map((sample, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t('Sample')} {index + 1}
                </h3>
                {formData.samples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSample(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    {t('Delete')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Input')}
                  </label>
                  <textarea
                    value={sample.input}
                    onChange={(e) => updateSample(index, 'input', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Output')}
                  </label>
                  <textarea
                    value={sample.output}
                    onChange={(e) => updateSample(index, 'output', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Test Case Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('Test_Case')} *
          </h2>

          <div className="mb-4">
            <input
              type="file"
              onChange={handleTestCaseUpload}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-900 dark:file:text-blue-200"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('Upload_Zip_File')}
            </p>
          </div>

          {formData.test_case_id && (
            <div className="mt-4">
              <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                {t('Test_Case_Uploaded')}: {formData.test_case_id}
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        {t('Input_File')}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        {t('Output_File')}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        {t('Score')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {formData.test_case_score.map((tc, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">
                          {tc.input_name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">
                          {tc.output_name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {tc.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Rule Type and IO Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('Advanced_Settings')}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Rule_Type')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="ACM"
                  checked={formData.rule_type === 'ACM'}
                  onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">ACM</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="OI"
                  checked={formData.rule_type === 'OI'}
                  onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">OI</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('IO_Mode')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="Standard IO"
                  checked={formData.io_mode.io_mode === 'Standard IO'}
                  onChange={(e) => setFormData({
                    ...formData,
                    io_mode: { ...formData.io_mode, io_mode: e.target.value }
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('Standard_IO')}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="File IO"
                  checked={formData.io_mode.io_mode === 'File IO'}
                  onChange={(e) => setFormData({
                    ...formData,
                    io_mode: { ...formData.io_mode, io_mode: e.target.value }
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('File_IO')}</span>
              </label>
            </div>

            {formData.io_mode.io_mode === 'File IO' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Input_File_Name')}
                  </label>
                  <input
                    type="text"
                    value={formData.io_mode.input}
                    onChange={(e) => setFormData({
                      ...formData,
                      io_mode: { ...formData.io_mode, input: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Output_File_Name')}
                  </label>
                  <input
                    type="text"
                    value={formData.io_mode.output}
                    onChange={(e) => setFormData({
                      ...formData,
                      io_mode: { ...formData.io_mode, output: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('Visible')}</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.share_submission}
                onChange={(e) => setFormData({ ...formData, share_submission: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('Share_Submission')}</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.spj}
                onChange={(e) => setFormData({ ...formData, spj: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('Special_Judge')}</span>
            </label>
          </div>

          {formData.spj && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('SPJ_Language')}
                </label>
                <select
                  value={formData.spj_language}
                  onChange={(e) => setFormData({ ...formData, spj_language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="C">C</option>
                  <option value="C++">C++</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('SPJ_Code')}
                </label>
                <textarea
                  value={formData.spj_code}
                  onChange={(e) => setFormData({ ...formData, spj_code: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleCompileSPJ}
                disabled={compiling}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
              >
                {compiling ? t('Compiling') : t('Compile_SPJ')}
              </button>

              {formData.spj_compile_ok && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ {t('SPJ_Compiled_Successfully')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/problems')}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
          >
            {t('Cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? t('Creating') : t('Create_Problem')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProblem
