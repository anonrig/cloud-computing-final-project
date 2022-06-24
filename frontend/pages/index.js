import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import {toast} from 'react-hot-toast'
import config from "../config";
import axios from "axios";

export default function Home() {
  const router = useRouter()
  const [entries, setEntries] = useState([])
  const [entry, setEntry] = useState('')

  const getEntries = useCallback(async () => {
    try {
      const {data: {rows}} = await axios.get(config.api_url + '/items', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setEntries(rows)
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  const createEntry = useCallback(async (event) => {
    event.preventDefault()
    try {
      await axios.post(config.api_url + '/items', {
        text: entry
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setEntry('')
      toast.success('Saved entry')
      getEntries()
    } catch (error) {
      toast.error(error.message)
    }
  }, [getEntries, entry])

  const updateEntry = useCallback(async (id) => {
    try {
      await axios.put(config.api_url + '/items/' + id, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      getEntries()
    } catch (error) {
      toast.error(error.message)
    }
  }, [getEntries])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/signin')
    } else {
      getEntries()
    }
  }, [])

  console.log(entry)

  return (
    <>
      <header className="bg-indigo-600">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
            <div className="flex items-center">

            </div>
            <div className="ml-10 space-x-4">
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  router.push('/signin')
                }}
                className="inline-block bg-white py-2 px-4 border border-transparent rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Log out
              </button>
            </div>
          </div>
        </nav>
      </header>
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto pt-8">
            <form onSubmit={createEntry}>
              <label htmlFor="entry" className="block text-sm font-medium text-gray-700">
                Add your entry
              </label>
              <div className="mt-1">
              <textarea
                rows={4}
                name="entry"
                id="entry"
                onChange={(event) => setEntry(event.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue={entry}
              />
              </div>
              <div className="mt-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create
                </button>
              </div>
            </form>

            <fieldset className="mt-8">
              <legend className="text-lg font-medium text-gray-900">Entries</legend>
              <div className="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200">
                {entries.map((e) => (
                  <div key={e.id} className="relative flex items-start py-4">
                    <div className="min-w-0 flex-1 text-sm">
                      <label htmlFor={`entry-${e.id}`} className="font-medium text-gray-700 select-none">
                        {e.text}
                      </label>
                    </div>
                    <div className="ml-3 flex items-center h-5">
                      <input
                        id={`entry-${e.id}`}
                        name={`person-${e.id}`}
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        defaultChecked={e.completed}
                        onChange={() => updateEntry(e.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </>
  )
}
