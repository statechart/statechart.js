<scxml version="1.0" initial="s1">

  <state id="s1" initial="s1p1">
    <onentry>
      <send event="timeout" delay="1s"/>
    </onentry>
    <transition event="timeout" target="fail"/>

    <parallel id="s1p1">
      <transition event="done.state.s1p1" target="pass"/>

      <state id="s1p11" initial="s1p111">
        <state id="s1p111">
          <transition target="s1p11final"/>
        </state>
        <final id="s1p11final"/>
      </state>

      <state id="s1p12" initial="s1p121">
        <state id="s1p121">
          <transition target="s1p12final"/>
        </state>
        <final id="s1p12final"/>
      </state>

    </parallel>
  </state>


  <final id="pass"></final>
  <final id="fail"></final>

</scxml>
