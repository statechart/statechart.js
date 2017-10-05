<scxml initial="s0" version="1.0">
  <state id="s0" initial="s01">
    <onentry>
      <send event="timeout" delay={ () => '1s' }/>
    </onentry>

    <transition event="timeout" target="pass"/>
    <transition event="event1" target="fail"/>

    <state id="s01" initial="s011">
      <onexit>
        <if cond={ (_, { In }) => In('s011') }>
          <raise event="event1"/>
        </if>
      </onexit>

      <state id="s011">
        <transition target="s02"/>
      </state>
    </state>

    <state id="s02"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
