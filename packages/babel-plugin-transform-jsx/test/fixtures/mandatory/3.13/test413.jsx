<scxml initial="s2p112 s2p122" version="1.0">

  <state id="s1">
    <transition target="fail"/>
  </state>

  <state id="s2" initial="s2p1">
    <parallel id="s2p1">
      <transition target="fail"/>

      <state id="s2p11" initial="s2p111">
        <state id="s2p111">
          <transition target="fail"/>
        </state>

        <state id="s2p112">
          <transition cond={ (_, { In }) => In('s2p122') } target="pass"/>
        </state>
      </state>

      <state id="s2p12" initial="s2p121">
        <state id="s2p121">
          <transition target="fail"/>
        </state>

        <state id="s2p122">
          <transition cond={ (_, { In }) => In('s2p112') } target="pass"/>
        </state>
      </state>

    </parallel>

  </state>

  <final id="pass"></final>
  <final id="fail"></final>

</scxml>
