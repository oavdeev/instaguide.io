import Inferno from 'inferno';
import Component from 'inferno-component';
import * as Utils from './Utils';

var all_columns = [
  {
    field: "instanceType",
    name: "Type",
    className: "col-text",
    sortKey: (x) => parseInstanceSize(x),
    groupKey: (x) => x.instanceType.split(".")[0],
    format: (x) => (<a href={"/info.html?type=" + x}>{x}</a> )
  },
  {
    field: "vcpu",
    name: "vCPU",
    className: "col-numeric",
    sortKey: (x) => parseInt(x)
  },
  {
    field: "memory",
    name: "Memory",
    className: "col-numeric",
    sortKey: (x) => parseFloat(x.replace(",", "")),
    format: (x) => x.replace("Gib", "GiB")
  },
  {
    field: "storage",
    name: "Storage",
    sortKey: parseStorage,
    format: (x) => /SSD|HDD|only$/.test(x) ? x.replace("NVMe SSD", "NVMe") : x + " HDD",
    className: "col-numeric"
  },
  {
    field: "physicalProcessor",
    name: "Processor",
    className: "col-text",
    /*
     * Having "Intel" and "Xeon" there looks a bit redundant and takes
     * horizontal space.
     */
    format: (x, i) => {
      const val = x.replace("High Frequency Intel", "")
      .replace("Intel", "")
      .replace("E5-2676v3", "E5-2676 v3") /* no idea why is it like that */
      .replace("Ivy Bridge/Sandy Bridge", "Ivy/Sandy Bridge");
      return (<a href={"/info.html?type=" + i.instanceType}>{val}</a>)
    }
  },
  {
    field: "networkPerformance",
    name: "Network",
    className: "col-text"
  },

  makeOnDemandField("_ondemand_abs", "abs"),
  makeOnDemandField("_ondemand_ond", "ond"),
  makeOnDemandField("_ondemand_ram", "ram"),
  makeOnDemandField("_ondemand_vcpu", "vcpu"),

  makeReservedField("_reserved_abs", "abs"),
  makeReservedField("_reserved_ond", "ond"),
  makeReservedField("_reserved_ram", "ram"),
  makeReservedField("_reserved_vcpu", "vcpu"),

  makeSpotField("_spot_abs", "abs"),
  makeSpotField("_spot_ond", "ond"),
  makeSpotField("_spot_ram", "ram"),
  makeSpotField("_spot_vcpu", "vcpu")

];

function makeOnDemandField(fieldName, priceCalc) {
  return {
    field: fieldName,
    name: (cp) => "On-Demand, " + (priceCalc == "ond" ? "$" : calcUnits[priceCalc]),
    className: "col-numeric",
    sortKey: (x) => parseFloat(x),
    compute: (i, cp) => onDemandCalc[priceCalc](i, cp)
  }
}

function makeReservedField(fieldName, priceCalc) {
  return {
    field: fieldName,
    name: (cp) => "Reserved, " + calcUnits[priceCalc],
    className: "col-numeric",
    sortKey: (x) => ((x === undefined) ? -1000 : parseFloat(x)),
    compute: (i, cp) => reservedCalc[priceCalc](i, cp)
  }
}

function makeSpotField(fieldName, priceCalc) {
  return {
    field: fieldName,
    name: (cp) => "Spot, " + calcUnits[priceCalc],
    className: "col-numeric",
    sortKey: (x) => ((x === undefined || !x.length) ? -1000 : x[0]),
    compute: (i, cp) => spotCalc[priceCalc](i, cp),
    format: x => spotFmt[priceCalc](x)
  }
}

function onDemandRAM(i, cp) {
  return Utils.formatFix(parseFloat(i.price_ondemand_hr) * Utils.parsePeriod(cp.period), cp.period == "hr" ? 4 : 2)
}

const calcUnits = { "abs": "$", "ond": "%", "ram": "$/GiB", "vcpu": "$/vCPU" };
const onDemandCalc = {
  "abs": (i, cp) => Utils.fmtAbsPrice(i.price_ondemand_hr, cp.period),
  "ond": (i, cp) => Utils.fmtAbsPrice(i.price_ondemand_hr, cp.period),
  "ram": (i, cp) => Utils.fmtAbsPrice(i.price_ondemand_hr / parseFloat(i.memory.replace(",", "")), cp.period),
  "vcpu": (i, cp) => Utils.fmtAbsPrice(i.price_ondemand_hr / parseFloat(i.vcpu), cp.period)
};

const reservedCalc = {
  "abs": (i, cp) => Utils.fmtAbsPrice(reservedEffPrice(i, cp.reservationTerm), cp.period),
  "ond": (i, cp) => formatReservedDiscount(i, cp),
  "ram": (i, cp) => Utils.fmtAbsPrice(reservedEffPrice(i, cp.reservationTerm) / parseFloat(i.memory.replace(",", "")), cp.period),
  "vcpu": (i, cp) => Utils.fmtAbsPrice(reservedEffPrice(i, cp.reservationTerm) / parseFloat(i.vcpu), cp.period)
};

const spotCalc = {
  "abs": (i, cp) => spotEffPrice(i, cp.period),
  "ond": (i, cp) => spotDiscount(i),
  "ram": (i, cp) => spotEffPrice(i, cp.period).map((x) => x / parseFloat(i.memory.replace(",", ""))),
  "vcpu": (i, cp) => spotEffPrice(i, cp.period).map((x) => x / parseFloat(i.vcpu.replace(",", ""))),
};

const spotFmt = {
  "abs": Utils.formatSpotAbs,
  "ond": Utils.formatSpotDiscount,
  "ram": Utils.formatSpotAbs,
  "vcpu": Utils.formatSpotAbs,
};


function parseStorage(x) {
  if (x.trim() == "EBS only") {
    return -1;
  } else {
    let parts = x.split(" ");
    if (parts.length >= 3) {
      return parseInt(parts[0]) * parseInt(parts[2].replace(",", ""))
    } else {
      console.log("Cannot parse storage: ", x)
    }
  }

}

function formatReservedDiscount(i, cp) {
  let d = reservedDiscount(i, cp.reservationTerm);
  if (d === undefined)
    return "N/A"
  return Utils.formatFix(d, 1) + "%"
}
function reservedEffPrice(i, term) {
  let parts = term.split("_");
  let reserved_term_hours = (parts[0] == "1yr") ? (365 * 24) : (365 * 24 * 3);
  let upfront_k = "price_r_" + term + "_upfront";
  let hr_k = "price_r_" + term + "_hr";

  let upfront = 0;
  let hr = undefined;

  if (upfront_k in i && i[upfront_k] != null)
    upfront = parseFloat(i[upfront_k]);

  if (hr_k in i && i[hr_k] != null)
    hr = parseFloat(i[hr_k]);

  if ((hr === undefined) || (upfront == undefined))
    return undefined;

  return (hr + upfront / reserved_term_hours);
}

function reservedDiscount(i, term) {
  let rp =  reservedEffPrice(i, term);
  if (rp === undefined)
    return undefined;
  return (100 * rp / parseFloat(i.price_ondemand_hr))
}

function spotEffPrice(i, period) {

  if (i.spot_prices) {
    let _max = Math.max(...i.spot_prices);
    let _min = Math.min(...i.spot_prices);

    let r = [_min * Utils.parsePeriod(period), _max * Utils.parsePeriod(period)]
    return r
  } else
    return []

}

function spotDiscount(i) {

  if (i.spot_prices) {
    let _max = Math.max(...i.spot_prices);
    let _min = Math.min(...i.spot_prices);

    let r = [(100 * (_min) / parseFloat(i.price_ondemand_hr)),
    (100 * (_max) / parseFloat(i.price_ondemand_hr))]
    return r
  } else
    return []

}

function parseInstanceSize(x) {
  let parts = x.split(".")
  const sizemap = {
    'nano': ['000', 1],
    'micro': ['000', 2],
    'small': ['000', 3],
    'medium': ['000', 4],
    'large': ['000', 5],
    'xlarge': ['000', 6],
    'metal': ['999', 7]
  };
  if (parts[1] in sizemap)
    return [parts[0], sizemap[parts[1]][0], sizemap[parts[1]][1]];
  else {
    let p = parts[1].match(/^(\d+)/)[0];
    return [parts[0], Utils.leftpad(p, 3, "0"), parts[1]];
  }
}

var _field_index = {}
for (var i in all_columns) {
  _field_index[all_columns[i].field] = all_columns[i]
}

function col_by_field(field) {
  return _field_index[field];
}

function colname(c, cp) {
  if (c.name) {
    if (c.subtitle) {
      return <span>{c.name}<br /><span className="subtitle">{c.subtitle}</span></span>
    } else
      return (typeof c.name == "function") ? c.name(cp) : c.name;
  }
  else
    return c.field;
}

class InstanceRow extends Component {
  render() {
    var cols = [];
    for (var i in this.props.columns) {
      let c = this.props.columns[i]
      let val = this.props.val;

      if (this.props.val === undefined) {
        val = this.props.instance[c.field];
        if (c.compute)
          val = c.compute(this.props.instance, this.props.computeProps);
        if (c.format)
          val = c.format(val, this.props.instance)
      }

      let classNames = [c.className, "field-" + c.field]
      if (c.field == this.props.sortField)
        classNames.push("sort-col");

      cols.push(<td className={classNames.join(" ")}>{val}</td>)
    }

    let classNames = [];
    if (this.props.firstInGroup) {
      classNames.push("group-first")
    }
    if (this.props.groupNum !== undefined) {
      if (this.props.groupNum % 2 == 0) {
        classNames.push("group-even")
      } else {
        classNames.push("group-odd")
      }
    }

    return (<tr className={classNames.join(" ")}>{cols}</tr>);
  }
}

function cmp(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export default class InstanceTable extends Component {

  onHeaderClick(f) {
    var dir = this.props.sortDir;
    if (!this.props.sortDir)
      dir = -1;

    this.props.settings.set({ sortDir: this.props.sortField == f ? -dir : dir, sortField: f });
  }

  render() {
    var rows = [];
    var head = [];

    const typesFilters = {
      'all': (x) => true,
      'current': (x) => x.isCurrentGen,
      'emr': (x) => x.isCurrentGen
    }
    let computeProps = {
      reservationTerm: this.props.reservationTerm,
      period: this.props.period,
      priceCalc: this.props.priceCalc
    }

    function priceCalcColFilter(c) {
      if (c.field.startsWith('_ondemand_') || c.field.startsWith('_reserved_') || c.field.startsWith('_spot_')) {
        if (!c.field.endsWith('_' + computeProps.priceCalc))
          return false
      }

      return true;
    }

    let vis_columns = this.props.columns.filter(priceCalcColFilter);

    for (var i in vis_columns) {
      var c = vis_columns[i]
      const f = c.field;
      var icon = "";

      let classNames = [c.className, "field-" + c.field]

      if (this.props.sortField == f) {
        if (this.props.sortDir > 0)
          icon = <i className="ion-arrow-up-b"></i>
        else
          icon = <i className="ion-arrow-down-b"></i>
      }


      head.push(<th className={this.props.sortField == f ? "sort-col" : ""}
                    onClick={() => this.onHeaderClick(f)}>
                    <div className={classNames.join(" ")}>
                    <span className="colhead-span">{icon}{colname(c, computeProps)}</span>
                    </div>
                </th>)
    }

    var sorted = this.props.instances.filter(typesFilters[this.props.typesFilter])
    let groupF = undefined

    if (this.props.sortField) {
      const sortField = this.props.sortField
      const sortDir = this.props.sortDir

      console.log("sorting by ", sortField)
      var keyF = col_by_field(this.props.sortField).sortKey
      var compF = col_by_field(this.props.sortField).compute
      groupF = col_by_field(this.props.sortField).groupKey

      if (compF === undefined)
        compF = (x) => x[sortField];

      if (!keyF) {
        sorted.sort((a, b) => sortDir * cmp(compF(a, computeProps), compF(b, computeProps)))
      } else {
        sorted.sort((a, b) => sortDir * cmp(keyF(compF(a, computeProps)), keyF(compF(b, computeProps))))
      }

    }

    let groupNum = undefined
    let prevGroupKey = undefined

    for (var i in sorted) {
      let firstInGroup = false
      if (groupF !== undefined) {
        groupNum = groupNum || 0

        let groupKey = groupF(sorted[i]);
        if (prevGroupKey != groupKey) {
          groupNum += 1
          firstInGroup = true
        }
        prevGroupKey = groupKey;
      }

      rows.push(<InstanceRow firstInGroup={firstInGroup}
        groupNum={groupNum}
        sortField={this.props.sortField}
        instance={sorted[i]}
        columns={vis_columns}
        computeProps={computeProps} />)
    }

    if (sorted.length == 0) {
      for (i = 0; i < 75; i++) {
        rows.push(<InstanceRow columns={vis_columns} val={""}
                           sortField={this.props.sortField}/>)
      }
    }

    return (
      <div className="table-wrapper">
      <table className="instance-table">
        <thead>
          {head}
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
      </div>
    );
  }
}

InstanceTable.defaultProps = { columns: all_columns, instances: [] }
