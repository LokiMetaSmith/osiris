import re

with open('src/app/flight-ops/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '                        {d.airworthiness_status.toUpperCase()}\n                      </span>\n                    </td>\n                  </tr>',
    '                        {d.airworthiness_status.toUpperCase()}\n                      </span>\n                    </td>\n                    <td className="p-2">\n                      <button className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-white" onClick={() => alert(JSON.stringify(d.baseline_qualification, null, 2))}>View JSON</button>\n                    </td>\n                  </tr>'
)

with open('src/app/flight-ops/page.tsx', 'w') as f:
    f.write(content)
