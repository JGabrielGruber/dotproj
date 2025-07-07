/**
 * Renders description content (string, object, or error)
 * @param {string|Error|object|null} description - The description to render
 * @returns {string|JSX.Element}
 */
export const renderDescription = (description) => {
  if (!description) return null
  if (typeof description === 'string') return description
  if (description instanceof Error) return description.message
  if (typeof description === 'object') {
    return (
      <pre
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          maxHeight: '200px',
          overflow: 'auto',
        }}
      >
        {JSON.stringify(description, null, 2)}
      </pre>
    )
  }
  return String(description)
}
