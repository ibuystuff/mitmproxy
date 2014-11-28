var FlowRow = React.createClass({
    render: function () {
        var flow = this.props.flow;
        var columns = this.props.columns.map(function (Column) {
            return <Column key={Column.displayName} flow={flow}/>;
        }.bind(this));
        var className = "";
        if (this.props.selected) {
            className += "selected";
        }
        return (
            <tr className={className} onClick={this.props.selectFlow.bind(null, flow)}>
                {columns}
            </tr>);
    },
    shouldComponentUpdate: function (nextProps) {
        return true;
        // Further optimization could be done here
        // by calling forceUpdate on flow updates, selection changes and column changes.
        //return (
        //(this.props.columns.length !== nextProps.columns.length) ||
        //(this.props.selected !== nextProps.selected)
        //);
    }
});

var FlowTableHead = React.createClass({
    render: function () {
        var columns = this.props.columns.map(function (column) {
            return column.renderTitle();
        }.bind(this));
        return <thead>
            <tr>{columns}</tr>
        </thead>;
    }
});


var ROW_HEIGHT = 32;

var FlowTable = React.createClass({
    mixins: [StickyHeadMixin, AutoScrollMixin, VirtualScrollMixin],
    getInitialState: function () {
        return {
            columns: all_columns
        };
    },
    componentWillMount: function () {
        if (this.props.view) {
            this.props.view.addListener("add update remove recalculate", this.onChange);
        }
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.view !== this.props.view) {
            if (this.props.view) {
                this.props.view.removeListener("add update remove recalculate");
            }
            nextProps.view.addListener("add update remove recalculate", this.onChange);
        }
    },
    getDefaultProps: function () {
        return {
            rowHeight: ROW_HEIGHT
        };
    },
    onScroll2: function () {
        this.adjustHead();
        this.onScroll();
    },
    onChange: function () {
        console.log("onChange");
        this.forceUpdate();
    },
    scrollIntoView: function (flow) {
        this.scrollRowIntoView(
            this.props.view.index(flow),
            this.refs.body.getDOMNode().offsetTop
        );
    },
    renderRow: function (flow) {
        var selected = (flow === this.props.selected);
        return <FlowRow key={flow.id}
            ref={flow.id}
            flow={flow}
            columns={this.state.columns}
            selected={selected}
            selectFlow={this.props.selectFlow}
        />;
    },
    render: function () {
        var flows = this.props.view ? this.props.view.flows : [];

        var rows = this.renderRows(flows);

        return (
            <div className="flow-table" onScroll={this.onScroll2}>
                <table>
                    <FlowTableHead ref="head"
                        columns={this.state.columns}/>
                    <tbody ref="body">
                        { this.getPlaceholderTop() }
                        {rows}
                        { this.getPlaceholderBottom(flows.length) }
                    </tbody>
                </table>
            </div>
        );
    }
});
