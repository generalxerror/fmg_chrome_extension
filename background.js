// const domainUrl = 'http://localhost:3000'
// const apiUrl    = 'http://localhost:8000/api'


const domainUrl = 'https://fairmobile.games'
const apiUrl    = 'https://api.fairmobile.games/api'

async function postData(appId) {
  let formData = new FormData()
  formData.append('search_query', appId)

  const response = await fetch(`${apiUrl}/extension/search`, {
    method: "POST",
    headers: {
      "Accept": "application/json"
    },
    body: formData,
  })

  return response.json()
}

function injectButton(data, url) {
  let fmgButton = document.querySelector('#fairmobilegames-button')

  if(!fmgButton) {
    let newElement = document.createElement('a')

    newElement.textContent            = `This app has ${data.reports_count} report(s) on FairMobileGames. Click here to see.`
    newElement.id                     = 'fairmobilegames-button'
    newElement.href                   = url
    newElement.style.display          = 'block'
    newElement.style.backgroundColor  = '#e84c4c'
    newElement.style.color            = '#ffffff'
    newElement.style.padding          = '15px'
    newElement.style.fontWeight       = 'bold'
    newElement.style.fontSize         = '14px'

    let titleEl = document.querySelector('[itemprop=name]')
    titleEl.parentElement.prepend(newElement)
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && changeInfo.url.includes('https://play.google.com/store')) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      let currentUrl  = tabs[0].url
      let url         = new URL(currentUrl)
      let params      = new URLSearchParams(url.search)
      let appId       = params.get('id')

      postData(appId).then((data) => {
        if(data.search_result) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func : injectButton,
            args : [ data.search_result, `${domainUrl}/app/${data.search_result.id}` ],
          })
          .then(() => {
            console.log("script injected")
          })
          .catch(err => console.log(err))
        }
      })
    })
  }
})