'use strict'

import React, {
	View,
	Text,
	Navigator,
	StyleSheet,
	TouchableOpacity,
} from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux/native'
import {
	setSearchKeyword,
	runSearch,
	moreVideos,
	newSearch,
	viewVideo,
	viewVideoUnload,
	listPlaylist,
	listPlaylistUnload,
	addToPlaylist
} from './actions'
import Search from './components/search'
import SearchResult from './components/search_result'
import VideoDetails from './components/video_details'
import Playlists from './components/playlists'

const NavigationBarRouteMapper = {
  LeftButton(route, navigator, index, navState) {
    if (index === 0) {
    	return (
    		<TouchableOpacity
	        onPress={navigator.props.newSearch}
	        style={styles.navBarLeftButton}>
	        <Text style={[styles.navBarText, styles.navBarButtonText]}>
	          &laquo; Search
	        </Text>
	      </TouchableOpacity>
	     )
    }

    const previousRoute = navState.routeStack[index - 1]
    return (
      <TouchableOpacity
        onPress={() => navigator.pop()}
        style={styles.navBarLeftButton}>
        <Text style={[styles.navBarText, styles.navBarButtonText]}>
          &laquo; {(index === 1)  ? 'Result' : 'Back'}
        </Text>
      </TouchableOpacity>
    )
  },

  RightButton(route, navigator, index, navState) {
  	return null
  },

  Title(route, navigator, index, navState) {
    return (
      <Text style={[styles.navBarText, styles.navBarTitleText]}>
        {route.title}
      </Text>
    )
  }
}

class App extends React.Component {
	componentWillReceiveProps(nextProps) {
		let routes = []
		if (this.refs.navigator) {
			routes = this.refs.navigator.getCurrentRoutes()
		}

		const hasVideoDetails = routes.length === 2
		const hasPlaylists = routes.length === 3

	  if (nextProps.playlist.isViewingListPlaylist && !nextProps.playlist.isViewingListPlaylistWithoutNavigator) {
	  	if (hasPlaylists) return
	  	this.refs.navigator.push({
	  		id: 'playlists',
	  		title: 'Playlists',
	  		index: 2
	  	})
	  } else if (nextProps.search.viewedVideo) {
	  	if (hasVideoDetails) return
	  	this.refs.navigator.push({
	  		id: 'videoDetails',
	  		title: nextProps.search.viewedVideo.snippet.title.substring(0, 20) + '...',
	  		index: 1
	  	})
	  }
	}

	renderScene(route, navigator) {
		switch (route.id) {
			case 'result':
				return (
					<View style={styles.scene}>
						<SearchResult
							isSearching={this.props.search.isSearching}
							keyword={this.props.search.keyword}
							result={this.props.search.result}
							moreVideos={this.props.moreVideos}
							viewVideo={this.props.viewVideo}
							isViewingVideo={this.props.search.isViewingVideo}
							viewedVideo={this.props.search.viewedVideo} />
					</View>
				)
			case 'videoDetails':
				return (
					<View style={styles.scene}>
						<VideoDetails
							navigator={navigator}
							viewVideoUnload={this.props.viewVideoUnload}
							viewedVideo={this.props.search.viewedVideo}
							listPlaylist={this.props.listPlaylist} />
					</View>
				)
			case 'playlists':
				return (
					<View style={styles.scene}>
						<Playlists
							navigator={navigator}
							playlist={this.props.playlist}
							listPlaylistUnload={this.props.listPlaylistUnload}
							addToPlaylist={this.props.addToPlaylist} />
					</View>
				)
		}
	}

	render() {
		let cmp = null
		if (this.props.search.isViewingResult) {
			cmp = (
				<Navigator
					ref="navigator"
					configureScene={(route) => Navigator.SceneConfigs.FloatFromLeft}
					initialRoute={{
						id: 'result',
						title: `'${this.props.search.keyword}'`,
						index: 0
					}}
					renderScene={this.renderScene.bind(this)}
					navigationBar={
	          <Navigator.NavigationBar
	          	style={styles.navBar}
	            routeMapper={NavigationBarRouteMapper} />
	        }
	        newSearch={this.props.newSearch} />
			)
		} else if (this.props.playlist.isViewingListPlaylist && this.props.playlist.isViewingListPlaylistWithoutNavigator) {
			cmp = (
				<View style={{
					flex: 1,
					paddingTop: 40
				}}>
					<Playlists
						playlist={this.props.playlist}
						listPlaylistUnload={this.props.listPlaylistUnload}
						addToPlaylist={this.props.addToPlaylist} />
				</View>
			)
		} else {
			cmp = (
				<Search
					error={this.props.search.error}
					keyword={this.props.search.keyword}
					isSearching={this.props.search.isSearching}
					setSearchKeyword={this.props.setSearchKeyword}
					runSearch={this.props.runSearch}
					listPlaylist={this.props.listPlaylist} />
			)
		}

		return (
			<View style={styles.container}>
				{cmp}
			</View>
		)
	}
}

const stateToProps = (state) => {
  return {
  	search: state.search,
  	playlist: state.playlist
 	}
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
  	setSearchKeyword,
	  runSearch,
	  moreVideos,
	  newSearch,
	  viewVideo,
	  viewVideoUnload,
	  listPlaylist,
	  listPlaylistUnload,
	  addToPlaylist
	}, dispatch)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center'
	},
	navBar: {
    backgroundColor: 'white',
  },
  navBarText: {
    fontSize: 16,
    marginVertical: 10,
  },
  navBarTitleText: {
    fontWeight: '500',
    marginVertical: 9,
  },
  navBarLeftButton: {
    paddingLeft: 10,
  },
  navBarRightButton: {
    paddingRight: 10,
  },
  scene: {
  	flex: 1,
  	paddingTop: 63,
  }
})

export default connect(stateToProps, dispatchToProps)(App)
