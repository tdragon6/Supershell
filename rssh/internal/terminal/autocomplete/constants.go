package autocomplete

//These are used as replacement tokens, e.g when one of these occurs in the output of Expect(...) then the corrosponding map[string]AutoComplete trie
//Is looked up, and then used to auto complete, just gives stuff more context aware autocomplete
const RemoteId = "<remote_id>"
const Functions = "<functions>"
const WebServerFileIds = "<file_ids>"
