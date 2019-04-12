import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
import * as serviceWorker from './serviceWorker';
import Masonry from '../node_modules/masonry-layout';



class Note extends React.Component {
	render() {
		var style = { backgroundColor: this.props.color };
		return (
			<div className="note" style={style}>
				<span className="delete-note" onClick={this.props.onDelete}> × </span>
				{this.props.children}
			</div>
		);
	}
};



class NoteEditor extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			text: '',
			color: ''
		}
		this.handleTextChange = this.handleTextChange.bind(this);
		this.handleNoteAdd = this.handleNoteAdd.bind(this);
		this.handleColorChange = this.handleColorChange.bind(this);
	}

	handleTextChange(event) {
		this.setState({ text: event.target.value });
	}

	handleColorChange(e) {
		this.setState({
			color: e.target.value
		})
	}

	handleNoteAdd() {
		var newNote = {
			text: this.state.text,
			color: this.state.color,
			id: Date.now()
		};

		this.props.onNoteAdd(newNote);
		this.setState({ text: '' });
	};

	render() {
		return (
			<div className="note-editor">
				<input type="color" onChange={this.handleColorChange}></input>
				<textarea
					placeholder="Enter your note here..."
					rows={5}
					className="textarea"
					value={this.state.text}
					onChange={this.handleTextChange}
				/>
				<button className="add-button" onClick={this.handleNoteAdd}>Add</button>
			</div>
		);
	}
};


class NotesGrid extends React.Component {
	componentDidMount() {
		var grid = this.refs.grid;
		this.msnry = new Masonry(grid, {
			itemSelector: '.note',
			columnWidth: 200,
			gutter: 10,
			isFitWidth: true
		});
	}

	componentDidUpdate(prevProps) {
		if (this.props.notes.length !== prevProps.notes.length) {
			this.msnry.reloadItems();
			this.msnry.layout();
		}
	};

	render() {
		var onNoteDelete = this.props.onNoteDelete;

		return (
			<div className="notes-grid" ref="grid">
				{
					this.props.notes.map(function (note) {
						return (
							<Note
								key={note.id}
								onDelete={onNoteDelete.bind(null, note)}
								color={note.color}>
								{note.text}
							</Note>
						);
					})
				}
			</div>
		);
	}
};


class NoteSearch extends React.Component {
	constructor(props) {
		super(props);
		this.handleSearchQuery = this.handleSearchQuery.bind(this);
	}

	handleSearchQuery(event) {
		var searchQuery = event.target.value.toLowerCase();
		if (event.target.value.length === 0 || event.keyCode === 13) {
			this.props.onNoteSearch(searchQuery);
			//event.target.value = null;
		}
	}

	render() {
		return (
			<div>
				<input
					type='text'
					className="search-field"
					placeholder='Search...'
					onKeyUp={this.handleSearchQuery} />
			</div>
		)
	}
}


class NotesApp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			notes: [],
			filteredNotes: []
		};
		this.handleNoteDelete = this.handleNoteDelete.bind(this)
		this.handleNoteAdd = this.handleNoteAdd.bind(this)
		this.handleSearchNote = this.handleSearchNote.bind(this)
	}

	componentDidMount() {
		var localNotes = JSON.parse(localStorage.getItem('notes'));
		if (localNotes) {
			this.setState({ notes: localNotes });
		}
	};

	componentDidUpdate(prevProps, prevState) {
		this._updateLocalStorage();
	};

	handleNoteAdd(newNote) {
		var newNotes = this.state.notes.slice();
		newNotes.unshift(newNote);
		this.setState(
			{
				notes: newNotes,
				filteredNotes: ''
			}
		);
	};

	handleNoteDelete(note) {
		var noteId = note.id;
		var newNotes = this.state.notes.filter(function (note) {
			return note.id !== noteId;
		});
		this.setState({ notes: newNotes });
	};

	handleSearchNote(searchQuery) {
		if (searchQuery) {
			var filteredNotes = this.state.notes.filter(function (el) {
				var searchValue = el.text.toLowerCase();
				return searchValue.indexOf(searchQuery) !== -1;
			})
			this.setState({ filteredNotes: filteredNotes })
		} else {
			this.setState({ filteredNotes: '' })
		}
	}

	render() {
		return (
			<div className="notes-app">
				<h2 className="app-header">NotesApp</h2>
				<NoteSearch onNoteSearch={this.handleSearchNote} />
				<NoteEditor onNoteAdd={this.handleNoteAdd} />
				<NotesGrid notes={this.state.filteredNotes.length > 0 ? this.state.filteredNotes : this.state.notes} onNoteDelete={this.handleNoteDelete} />
			</div>
		);
	};

	_updateLocalStorage() {
		var notes = JSON.stringify(this.state.notes);
		localStorage.setItem('notes', notes);
	}
};

ReactDOM.render(
	<NotesApp />,
	document.getElementById('mount-point')
);



serviceWorker.unregister();
